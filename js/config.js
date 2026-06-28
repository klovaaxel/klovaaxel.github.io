/**
 * Site configuration — runtime data for GitHub dashboard and theme system.
 * Theme chrome (colors, default) loads from #portfolio-theme-data in index.html.
 */

const THEME_META = {
    dark: { label: "Dark", icon: "moon" },
    light: { label: "Light", icon: "sun" },
    forest: { label: "Forest", icon: "tree" },
    ocean: { label: "Ocean", icon: "wave" },
    sketch: { label: "Sketch", icon: "pencil", requiresBorderShape: true },
};

/** Mirrors #portfolio-theme-data — used when DOM is unavailable (e.g. Node tests). */
const THEME_BOOTSTRAP_FALLBACK = {
    defaultTheme: "dark",
    themes: [
        { id: "dark", themeColor: "#0c0c0e", statusBarStyle: "black-translucent" },
        { id: "light", themeColor: "#f7f5f0", statusBarStyle: "default" },
        { id: "forest", themeColor: "#0d1410", statusBarStyle: "black-translucent" },
        { id: "ocean", themeColor: "#080d14", statusBarStyle: "black-translucent" },
        { id: "sketch", themeColor: "#f0e9dc", statusBarStyle: "default" },
    ],
};

function loadPortfolioThemeData() {
    if (typeof document !== "undefined") {
        const element = document.getElementById("portfolio-theme-data");
        if (element?.textContent) {
            return JSON.parse(element.textContent);
        }
    }
    return THEME_BOOTSTRAP_FALLBACK;
}

const themeBootstrap = loadPortfolioThemeData();

export const config = {
    name: "Axel Karlsson",
    role: "AI Engineer",

    github: {
        username: "klovaaxel",
        url: "https://github.com/klovaaxel",
    },

    themes: themeBootstrap.themes.map((theme) => ({
        ...theme,
        ...THEME_META[theme.id],
    })),

    defaultTheme: themeBootstrap.defaultTheme,
};
