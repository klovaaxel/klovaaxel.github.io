import { config } from "./config.js";
import { refreshCursorTargets } from "./cursor.js";
import { announceStatus } from "./live-region.js";
import { pickRandomThemeId, SKETCH_THEME_ID } from "./theme-pick.js";

const THEME_TRANSITION_MS = 750;
const THEME_SWEEP_MS = 1200;
const SKETCH_FONTS_ID = "sketch-fonts";
const SKETCH_FONTS_HREF =
    "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Patrick+Hand&display=swap";

export function supportsSketchTheme() {
    return CSS.supports("border-shape", "circle(50%)");
}

export function resolveTheme(themeId) {
    const exists = config.themes.some((theme) => theme.id === themeId);
    if (!exists) return config.defaultTheme;

    if (themeId === SKETCH_THEME_ID && !supportsSketchTheme()) {
        return config.defaultTheme;
    }

    return themeId;
}

function ensureSketchFonts() {
    if (document.getElementById(SKETCH_FONTS_ID)) return;

    const link = document.createElement("link");
    link.id = SKETCH_FONTS_ID;
    link.rel = "stylesheet";
    link.href = SKETCH_FONTS_HREF;
    document.head.appendChild(link);
}

export function pickRandomTheme(options = {}) {
    const supportsSketch = options.supportsSketch ?? supportsSketchTheme();
    return pickRandomThemeId(config.themes, config.defaultTheme, supportsSketch);
}

export function readInitialThemeFromDocument() {
    const fromDom = document.documentElement.dataset.theme;
    return fromDom ? resolveTheme(fromDom) : pickRandomTheme();
}

export function initTheme() {
    try {
        localStorage.removeItem("axel-portfolio-theme");
    } catch {
        // Ignore storage errors (private mode, blocked APIs).
    }

    setTheme(readInitialThemeFromDocument(), undefined, { silent: true });
    wireThemeSwitcher();
}

export function setTheme(themeId, event, options = {}) {
    const { silent = false } = options;
    const root = document.documentElement;
    const resolvedTheme = resolveTheme(themeId);
    const previousTheme = root.dataset.theme;
    const isThemeChange = !silent && Boolean(previousTheme) && previousTheme !== resolvedTheme;

    if (isThemeChange) {
        root.dataset.sweepFrom = previousTheme;
        playThemeSweep(event, () => {
            delete root.dataset.sweepFrom;
        });
        root.classList.add("theme-transitioning");
    }

    root.dataset.theme = resolvedTheme;

    if (resolvedTheme === SKETCH_THEME_ID) {
        ensureSketchFonts();
    }

    updateSwitcherState(resolvedTheme);
    updateBrowserChrome(resolvedTheme);

    if (isThemeChange) {
        const label = config.themes.find((theme) => theme.id === resolvedTheme)?.label ?? resolvedTheme;
        announceStatus(`${label} theme applied`);
    }

    if (isThemeChange) {
        window.setTimeout(() => root.classList.remove("theme-transitioning"), THEME_TRANSITION_MS);
    }
}

function playThemeSweep(event, onComplete) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        onComplete?.();
        return;
    }

    const root = document.documentElement;
    const x = event?.clientX ?? window.innerWidth * 0.85;
    const y = event?.clientY ?? window.innerHeight * 0.08;

    root.style.setProperty("--sweep-x", `${x}px`);
    root.style.setProperty("--sweep-y", `${y}px`);
    root.classList.add("theme-sweeping");

    window.setTimeout(() => {
        root.classList.remove("theme-sweeping");
        onComplete?.();
    }, THEME_SWEEP_MS);
}

function updateSwitcherState(activeId) {
    document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.dataset.theme === activeId ? "true" : "false");
    });
}

function updateBrowserChrome(themeId) {
    // Runtime meta theme-color only — site.webmanifest theme_color is static (see manifest _comment_theme_color).
    const theme =
        config.themes.find((item) => item.id === themeId) ??
        config.themes.find((item) => item.id === config.defaultTheme);
    if (!theme) return;

    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.themeColor);

    const statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusBar && theme.statusBarStyle) {
        statusBar.setAttribute("content", theme.statusBarStyle);
    }
}

function wireThemeSwitcher() {
    const container = document.getElementById("theme-switcher");
    if (!container || container.dataset.wired === "true") return;

    container.dataset.wired = "true";
    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".theme-btn");
        if (!btn) return;
        setTheme(btn.dataset.theme, e);
    });

    if (container.querySelector(".theme-btn")) {
        refreshCursorTargets();
    }

    updateSwitcherState(document.documentElement.dataset.theme);
}
