# Simplification audit — axel-portfolio

Audit of opportunities to simplify the codebase using native HTML and CSS instead of JavaScript, **without losing functionality**.

**Last reviewed:** 2026-06-28 (Phase 8 / DOC-003)  
**Companion doc:** [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md)

**PR status:** PR1, PR2, PR5 **complete**. PR4 (remove cursor) **declined** (SIM-002). PR3 hygiene optional. Connect section **removed** — contact merged into footer (UX-007, 2026-06).

---

## Executive summary

**Low-hanging simplification is largely shipped.** Content is HTML-first; theme switcher is static; GitHub uses `<template>` + DOM binding; boot is ~10 lines in `main.js`.

Remaining JS: theme session switcher + sweep, GitHub API, cursor/magnetic effects, live region.

| Scenario                               | Estimated JS reduction                                   |
| -------------------------------------- | -------------------------------------------------------- |
| Keep all current behavior              | **~15–25%** (hygiene + optional trims)                   |
| Drop custom cursor + magnetic/parallax | **~45–50%** (+158 lines from `cursor.js`) — **declined** |

**Not recommended:** CSS-only theme with zero JS — loses random boot, PWA `theme-color` / iOS status bar meta, sketch fallback when `border-shape` is unsupported, and screen-reader theme announcements.

---

## Keep in JavaScript (required)

| Feature                                     | Why JS must stay                                            |
| ------------------------------------------- | ----------------------------------------------------------- |
| **GitHub dashboard** (`github.js`)          | Async fetches, streak math, week grid, loading/error, cache |
| **Early theme boot** (`theme-bootstrap.js`) | Prevents flash; random theme per load (THEME-002)           |
| **`resolveTheme()` / sketch gating**        | Sketch fallback when `border-shape` unsupported             |
| **`updateBrowserChrome()`**                 | `theme-color` and iOS status bar meta                       |
| **Live region** (`live-region.js`)          | `aria-live` for GitHub load and theme changes               |
| **Theme sweep origin** (optional)           | Click coordinates for `--sweep-x/y`                         |
| **`refreshCursorTargets()`**                | Magnetic targets after GitHub render                        |

**Removed from scope:** `localStorage` theme persistence — site uses session-only switcher (THEME-001).

---

## Shipped simplifications

| PR  | Status   | Summary                                                |
| --- | -------- | ------------------------------------------------------ |
| PR1 | Complete | Static HTML: hero, about, skills, timeline, social     |
| PR2 | Complete | Static theme switcher; `theme-bootstrap.js` in head    |
| PR5 | Complete | GitHub `<template>` shells + DOM binding               |
| PR4 | Declined | Keep cursor; a11y mitigations instead (SIM-002)        |
| —   | Complete | Connect section removed; footer contact links (UX-007) |

---

## Optional future work

| Item                     | Recommendation                                   |
| ------------------------ | ------------------------------------------------ |
| PR3 — CSS/JS hygiene     | Dead keyframes, unused exports                   |
| Custom cursor            | Keep — removal declined                          |
| Theme sweep click-origin | Drop ring; keep beam (low priority)              |
| `js/html.js`             | Test-only `escapeHtml`; production uses DOM APIs |

---

## Anti-patterns to avoid

1. CSS-only theme without boot script — flash of wrong theme
2. Theme controls without `aria-live` announcements
3. `cursor: none` without keyboard guards
4. Empty HTML shells until JS runs
5. `:has()` theme refactor across all theme files — large churn
6. `details/summary` for timeline — loses semantic `<ol>`
7. Re-adding a Connect-sized contact section — use footer echo only
8. `innerHTML` for GitHub dashboard — use templates (PR5 done)

---

## Feature verdict table

| Topic               | Verdict                                                       |
| ------------------- | ------------------------------------------------------------- |
| Theme switching     | Static HTML buttons + `theme-bootstrap.js` + session JS       |
| GitHub dashboard    | Template refactor complete; `sanitizeHttpsImageUrl` (ENG-009) |
| Cursor effects      | **Keep** — SIM-002 won't fix                                  |
| Hero/about/footer   | **Static HTML**                                               |
| Experience timeline | **Static HTML**                                               |
| Social links        | **Static HTML** (hero nav)                                    |
| Live region         | Keep (~9 lines)                                               |
| Scroll reveals      | **CSS** — trim dead keyframes only (PR3)                      |

---

## Architecture note

`main.js` boot:

```js
initTheme();
initCursor();
refreshCursorTargets();
loadGitHubDashboard();
```

Content hydration is gone. Next simplification lever: PR3 hygiene only.
