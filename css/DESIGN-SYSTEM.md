# Design system

This portfolio uses a token-based CSS architecture for easy theming.

## Layers

1. **Tokens** (`css/tokens.css`) — structural values that stay constant across themes: font families, spacing scale, typography sizes, radii, motion.
2. **Themes** (`css/themes/*.css`) — color palettes scoped with `[data-theme="…"]`. Each theme overrides semantic color variables.
3. **Base** (`css/base.css`) — reset, element defaults, imports all theme files.
4. **Layout** (`css/layout.css`) — page regions and section spacing.
5. **Components** (`css/components.css`) — hero, cards, buttons, repo grid. All use semantic tokens, never hard-coded colors.

## Semantic color tokens

Every theme must define:

| Token                   | Purpose                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `--color-bg`            | Page background                                                    |
| `--color-bg-elevated`   | Raised surfaces (header, pills)                                    |
| `--color-bg-muted`      | Subtle backgrounds                                                 |
| `--color-surface`       | Cards                                                              |
| `--color-text`          | Primary text                                                       |
| `--color-text-muted`    | Secondary text (≥ 4.5:1 on `--color-bg`)                           |
| `--color-text-subtle`   | Tertiary text (≥ 4.5:1 on `--color-bg`; captions, periods, legend) |
| `--color-accent`        | Brand / interactive accent                                         |
| `--color-accent-hover`  | Accent hover state                                                 |
| `--color-accent-muted`  | Accent backgrounds                                                 |
| `--color-border`        | Default borders                                                    |
| `--color-border-strong` | Emphasized borders                                                 |
| `--color-link`          | Inline links                                                       |
| `--color-link-hover`    | Link hover                                                         |

## Adding a theme

```css
/* css/themes/sunset.css */
[data-theme="sunset"] {
    --color-bg: #1a0f14;
    --color-text: #fce8e0;
    --color-accent: #e87b5a;
    /* … all semantic tokens … */
}
```

Then import in `base.css` and register in `js/config.js`.

## Theme switching

`document.documentElement.dataset.theme` is set to the active theme id. A random theme is picked on each load via `js/theme-bootstrap.js`; the switcher applies choices for the current session only (no persistence).

## Ambient backgrounds (`css/theme-ambient.css`)

Decorative layers live in `.theme-ambient` inside `.page` (scrolls with content). One `.ambient-layer` per core theme; visibility toggled via `html[data-theme="…"]`.

| Theme  | Layer class       | Notes                                      |
| ------ | ----------------- | ------------------------------------------ |
| ocean  | `.ambient-ocean`  | SVG base + waves; bubbles page-absolute    |
| forest | `.ambient-forest` | SVG base (oversized, static); mist/leaves  |
| dark   | `.ambient-space`  | Nebula + stars                             |
| light  | `.ambient-sunny`  | Sun rays + clouds (high contrast on cream) |
| sketch | (none)            | Sketch CSS handles its own decor           |

**Rules when editing:**

- **Scroll model:** Background art scrolls with `.page`; particles are usually page-absolute. Do not pin the whole ambient stack to the viewport unless the user asks.
- **Bleed:** Oversize static bases (`inset: -6%`, `scale(1.06)`); animate overlays, not full-bleed rotated backgrounds.
- **Light themes:** Start decorative opacity high (~0.85+); pale-on-pale is easy to miss.
- **Motion:** `prefers-reduced-motion` disables ambient animations in `theme-ambient.css`.
- **Cards:** Ocean/forest/dark/light use frosted glass on dashboard cards (defined in `theme-ambient.css`).

Preview: `npm start` → http://localhost:8080 — cycle themes and scroll.

## Text contrast (A11Y-002)

`--color-text-muted` already met WCAG AA (4.5:1) on each theme’s `--color-bg`. `--color-text-subtle` was lightened on dark themes and darkened on light/sketch so captions (section subtitles, timeline periods, footer, contribution graph labels/legend) reach ≥ 4.5:1 on body backgrounds.

| Theme  | `--color-text-subtle` |
| ------ | --------------------- |
| dark   | `#8a8680`             |
| light  | `#6b6560`             |
| forest | `#7a9488`             |
| ocean  | `#7a8fa8`             |
| sketch | `#5c544c`             |

## Interactive contrast (A11Y-011)

Hero email CTA (`.hero-contact`) and social pills (`.social-link`) use **opaque** per-theme colors in `components.css` (not token-only `var(--color-accent)`) so they pass AA against ambient/decorative layers. Both use `isolation: isolate` to keep axe from compositing through backdrop blur.

E2E: `tests/e2e/smoke.spec.js` runs axe `color-contrast` on dark/light/forest/ocean after each theme switch settles (`prefers-reduced-motion`, wait for `.theme-transitioning` to clear). Sketch is excluded (hand-drawn palette). Ambient layers excluded from scan scope.

## Mixed language (A11Y-003 / UX-004)

Page default is `lang="en"` (UI chrome and narrative). Swedish résumé strings (job titles, degree names) are marked with `lang="sv"` on the containing element in static HTML. English-only strings stay unmarked. Future bilingual content: keep UI language consistent per section; wrap non-default-language phrases in an element with the appropriate `lang` attribute rather than changing the document root.
