import { config } from "./config.js";
import { refreshCursorTargets } from "./cursor.js";
import { announceStatus } from "./live-region.js";

const STORAGE_KEY = "axel-portfolio-theme";
const THEME_TRANSITION_MS = 750;
const THEME_SWEEP_MS = 1200;
const SKETCH_THEME_ID = "sketch";

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

function getAvailableThemes() {
    return config.themes.filter((theme) => !theme.requiresBorderShape || supportsSketchTheme());
}

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = resolveTheme(saved ?? config.defaultTheme);
    setTheme(theme);
    renderThemeSwitcher();
}

export function setTheme(themeId, event) {
    const root = document.documentElement;
    const resolvedTheme = resolveTheme(themeId);
    const isThemeChange = root.dataset.theme && root.dataset.theme !== resolvedTheme;

    if (isThemeChange) {
        playThemeSweep(event);
        root.classList.add("theme-transitioning");
    }

    root.dataset.theme = resolvedTheme;
    localStorage.setItem(STORAGE_KEY, resolvedTheme);
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

function playThemeSweep(event) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const x = event?.clientX ?? window.innerWidth * 0.85;
    const y = event?.clientY ?? window.innerHeight * 0.08;

    root.style.setProperty("--sweep-x", `${x}px`);
    root.style.setProperty("--sweep-y", `${y}px`);
    root.classList.add("theme-sweeping");

    window.setTimeout(() => root.classList.remove("theme-sweeping"), THEME_SWEEP_MS);
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

function renderThemeSwitcher() {
    const container = document.getElementById("theme-switcher");
    if (!container) return;

    container.innerHTML = getAvailableThemes()
        .map(
            (theme) => `
    <button
      type="button"
      class="theme-btn"
      data-magnetic
      data-theme="${theme.id}"
      aria-label="${theme.label} theme"
      aria-pressed="false"
      title="${theme.label}"
    >
      ${themeIcons[theme.icon] ?? themeIcons.moon}
    </button>
  `,
        )
        .join("");

    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".theme-btn");
        if (!btn) return;
        setTheme(btn.dataset.theme, e);
    });

    refreshCursorTargets();
    updateSwitcherState(document.documentElement.dataset.theme);
}

const themeIcons = {
    moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    tree: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 13 4-4"/><path d="M12 21V9"/><path d="M4 21h16"/><path d="m8 13-4-4"/><path d="M12 9V3"/><path d="m16 9 4-4"/></svg>`,
    wave: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
    pencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
};

(function applyEarlyTheme() {
    const themes = {
        dark: { color: "#0c0c0e", statusBar: "black-translucent" },
        light: { color: "#f7f5f0", statusBar: "default" },
        forest: { color: "#0d1410", statusBar: "black-translucent" },
        ocean: { color: "#080d14", statusBar: "black-translucent" },
        sketch: { color: "#f0e9dc", statusBar: "default" },
    };
    const supportsSketch = typeof CSS !== "undefined" && CSS.supports && CSS.supports("border-shape", "circle(50%)");
    const saved = localStorage.getItem(STORAGE_KEY) || "dark";
    const theme = saved === "sketch" && !supportsSketch ? "dark" : saved;
    const meta = themes[theme] || themes.dark;

    document.documentElement.dataset.theme = theme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", meta.color);

    const statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusBar) statusBar.setAttribute("content", meta.statusBar);
})();
