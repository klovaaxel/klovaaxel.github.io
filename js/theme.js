import { config } from "./config.js";
import { playThemeSweep } from "./motion.js";

import { refreshCursorTargets } from "./cursor.js";

const STORAGE_KEY = "axel-portfolio-theme";
const THEME_TRANSITION_MS = 750;

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = saved ?? config.defaultTheme;
    setTheme(theme);
    renderThemeSwitcher();
}

export function setTheme(themeId, event) {
    const root = document.documentElement;
    const isThemeChange = root.dataset.theme && root.dataset.theme !== themeId;

    if (isThemeChange) {
        playThemeSweep(event);
        root.classList.add("theme-transitioning");
    }

    root.dataset.theme = themeId;
    localStorage.setItem(STORAGE_KEY, themeId);
    updateSwitcherState(themeId);

    if (isThemeChange) {
        window.setTimeout(() => root.classList.remove("theme-transitioning"), THEME_TRANSITION_MS);
    }
}

function updateSwitcherState(activeId) {
    document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.dataset.theme === activeId ? "true" : "false");
    });
}

function renderThemeSwitcher() {
    const container = document.getElementById("theme-switcher");
    if (!container) return;

    container.innerHTML = config.themes
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
};

(function applyEarlyTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        document.documentElement.dataset.theme = saved;
    }
})();
