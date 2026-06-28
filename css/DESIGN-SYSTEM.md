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

## Text contrast (A11Y-002)

`--color-text-muted` already met WCAG AA (4.5:1) on each theme’s `--color-bg`. `--color-text-subtle` was lightened on dark themes and darkened on light/sketch so captions (section subtitles, timeline periods, footer, contribution graph labels/legend) reach ≥ 4.5:1 on body backgrounds.

| Theme  | `--color-text-subtle` |
| ------ | --------------------- |
| dark   | `#8a8680`             |
| light  | `#6b6560`             |
| forest | `#7a9488`             |
| ocean  | `#7a8fa8`             |
| sketch | `#5c544c`             |

## Mixed language (A11Y-003 / UX-004)

Page default is `lang="en"` (UI chrome and narrative). Swedish résumé strings (job titles, degree names) are marked with `lang="sv"` on the containing element in static HTML. English-only strings stay unmarked. Future bilingual content: keep UI language consistent per section; wrap non-default-language phrases in an element with the appropriate `lang` attribute rather than changing the document root.
