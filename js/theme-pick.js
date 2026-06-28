/**
 * Pure theme selection helpers — shared contract for theme-bootstrap.js and theme.js.
 */

export const SKETCH_THEME_ID = "sketch";

export function buildThemePool(themes, supportsSketch) {
    return themes.map((theme) => theme.id).filter((id) => id !== SKETCH_THEME_ID || supportsSketch);
}

export function pickRandomThemeId(themes, defaultTheme, supportsSketch, random = Math.random()) {
    const pool = buildThemePool(themes, supportsSketch);
    if (!pool.length) return defaultTheme;
    return pool[Math.floor(random * pool.length)];
}
