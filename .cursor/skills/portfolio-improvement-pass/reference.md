# Portfolio improvement pass — reference

## File map

| Path                      | Role                                                   |
| ------------------------- | ------------------------------------------------------ |
| `index.html`              | Content, `#portfolio-theme-data`, GitHub `<template>`s |
| `js/theme-bootstrap.js`   | Sync random theme before paint                         |
| `js/theme-pick.js`        | Shared pool logic (tests + theme.js)                   |
| `js/theme.js`             | Switcher, sweep, chrome meta                           |
| `js/github.js`            | API, cache, templates, grid keyboard                   |
| `js/cursor.js`            | Custom cursor + keyboard mode                          |
| `css/theme-ambient.css`   | Animated ambient layers (ocean/forest/space/sunny)     |
| `tests/smoke.test.js`     | HTML contract                                          |
| `tests/e2e/smoke.spec.js` | Browser + axe                                          |

## Common pitfalls (from retro)

| Pitfall                     | Prevention                                     |
| --------------------------- | ---------------------------------------------- |
| Double random theme         | Bootstrap picks once; `initTheme()` reads DOM  |
| localStorage drift          | No persistence; docs say session-only          |
| Scroll jump on load         | Grid init: tabindex only, no `.focus()`        |
| aria-label on bare div      | Add `role="status"` or equivalent              |
| Stale README/plan           | Update in same commit as behavior change       |
| Split plan ID across agents | One ID per PR/subagent                         |
| Fixed ambient layer         | `.theme-ambient` scrolls inside `.page`        |
| Invisible light decor       | Start opacity ≥ 0.85 on cream/pale backgrounds |
| Bubbles at document bottom  | Distribute with `top: %` across page height    |
| Rotating full-bleed SVG     | Oversize + clip base; sway mist only           |

## Adding a theme

1. `css/themes/your-theme.css` + import in `css/base.css`
2. Entry in `#portfolio-theme-data` (`index.html`)
3. `THEME_META` in `js/config.js`
4. Button in theme switcher (`index.html`)
5. If the theme needs ambient motion: add `.ambient-layer` in `index.html` + styles in `css/theme-ambient.css` (see DESIGN-SYSTEM ambient section)

Pool logic: keep `theme-bootstrap.js` aligned with `theme-pick.js`.

## Open product questions (ask user before changing)

- Remove Connect section vs keep quiet footer?
- Random theme every load vs first-visit-only?
