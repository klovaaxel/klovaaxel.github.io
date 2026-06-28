import { config } from "./config.js";
import { refreshCursorTargets } from "./cursor.js";
import { announceStatus } from "./live-region.js";

const STORAGE_KEY = "axel-portfolio-theme";
const THEME_TRANSITION_MS = 750;
const THEME_SWEEP_MS = 1200;
const SKETCH_THEME_ID = "sketch";
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

function isValidThemeId(themeId) {
    return config.themes.some((theme) => theme.id === themeId);
}

function ensureSketchFonts() {
    if (document.getElementById(SKETCH_FONTS_ID)) return;

    const link = document.createElement("link");
    link.id = SKETCH_FONTS_ID;
    link.rel = "stylesheet";
    link.href = SKETCH_FONTS_HREF;
    document.head.appendChild(link);
}

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    let userTheme = saved ?? config.defaultTheme;

    if (saved !== null && !isValidThemeId(saved)) {
        userTheme = config.defaultTheme;
        localStorage.setItem(STORAGE_KEY, config.defaultTheme);
    }

    setTheme(userTheme, undefined, { silent: true });
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

    if (!silent) {
        localStorage.setItem(STORAGE_KEY, themeId);
    }

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
    const theme = config.themes.find((item) => item.id === themeId) ?? config.themes[0];
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
