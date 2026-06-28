# Simplification audit — axel-portfolio

Audit of opportunities to simplify the codebase using native HTML and CSS instead of JavaScript, **without losing functionality**.

**Last reviewed:** 2026-06-28  
**Companion doc:** [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md)

**PR status:** PR1 and PR2 are **complete** (static HTML content + static theme switcher). PR4 (remove cursor) is **declined** — keep cursor with ongoing a11y improvements instead. PR3 remains optional future work. PR5 (GitHub template refactor) is **complete**.

---

## Executive summary

**Can we simplify meaningfully? Yes — and much of the low-hanging fruit is already shipped.**

Scroll reveals, hero entrance, theme palettes, and sketch gating already lean on CSS. Hero, experience, skills, connect, and social links are now static HTML (PR1). Theme switcher buttons are static in `index.html` (PR2). JavaScript is concentrated in: theme persistence/chrome, GitHub API rendering, and cursor/magnetic effects.

| Scenario                               | Estimated JS reduction                                              |
| -------------------------------------- | ------------------------------------------------------------------- |
| Keep all current behavior              | **~25–35%** (~200–280 of ~795 JS lines, excluding `config.js` data) |
| Drop custom cursor + magnetic/parallax | **~45–50%** (+158 lines from `cursor.js`)                           |

**Not recommended:** CSS-only theme with zero JS — loses `localStorage` persistence, PWA `theme-color` / iOS status bar meta, sketch fallback when `border-shape` is unsupported, and screen-reader theme announcements.

---

## Keep in JavaScript (required)

| Feature                                       | Why JS must stay                                                |
| --------------------------------------------- | --------------------------------------------------------------- |
| **GitHub dashboard** (`github.js`)            | Async fetches, streak math, week grid, loading/error states     |
| **Theme `localStorage`**                      | CSS cannot persist preference                                   |
| **Early theme boot** (inline `<head>` script) | Prevents flash of wrong theme before paint                      |
| **`resolveTheme()` / sketch gating**          | Saved `sketch` on unsupported browsers must fall back to `dark` |
| **`updateBrowserChrome()`**                   | `theme-color` and iOS status bar meta are not CSS-only          |
| **Live region** (`live-region.js`)            | `aria-live` for GitHub load and theme changes                   |
| **Theme sweep origin** (optional)             | Click coordinates for `--sweep-x/y`; can simplify to fixed beam |
| **`refreshCursorTargets()`**                  | Only if cursor/magnetic effects remain                          |

---

## Move to CSS/HTML (concrete proposals)

### 1. Theme switcher — static HTML + reduced JS

**Current:** `renderThemeSwitcher()` builds buttons via `innerHTML`.  
**Proposed:** Static buttons in `index.html`; slim JS for `data-theme`, storage, meta, announcements.  
**Keep `data-theme` on `<html>`** — refactoring all theme files to `:has()` is high churn for little gain.  
**Risk:** Low · **Functionality preserved:** Yes

### 2. Hero / about / connect — inline HTML

**Current:** Empty placeholders filled from `config.js` on `DOMContentLoaded`.  
**Proposed:** Static tagline, about, skills, hero meta, connect bio in `index.html`.  
**Risk:** Low–medium (lose single-file edit workflow) · **Improves no-JS fallback**

### 3. Experience timeline — static HTML

**Current:** `renderExperience()` maps `config.experience` to `innerHTML`.  
**Proposed:** Hand-authored `<ol class="timeline">` in `index.html`.  
**Risk:** Low · Scroll animations already target `.timeline-item` in CSS

### 4. Social links — deduplicate

**Current:** `renderSocialLinks()` called twice with identical config.  
**Proposed:** Static HTML in both navs, or SVG sprite.  
**Risk:** Low

### 5. Theme sweep — simplify trigger

**Current:** JS sets click-origin ring + beam.  
**Proposed:** Drop click-origin ring; JS only toggles classes (or fixed beam only).  
**Risk:** Low · Visual polish only

### 6. Deduplicate early-theme boot

**Current:** Same logic in `index.html` inline script **and** `theme.js` IIFE.  
**Proposed:** Keep only inline `<head>` script; delete `applyEarlyTheme` from `theme.js`.  
**Risk:** None

### 7. Scroll reveals — trim dead CSS

**Current:** Scroll-driven animations use `animation-timeline: view()` — no JS.  
**Proposed:** Delete unused pre-migration `@keyframes` (~90 lines in `animations.css`).  
**Risk:** None

### 8. GitHub dashboard — keep async, simplify render ✅ **Done**

**Implemented:** `<template>` elements in `index.html` + DOM binding in `js/github.js`; no `innerHTML` for API strings.

### 9. Cursor / magnetic — remove or keep

**No faithful CSS-only replacement** for parallax/magnetic/custom cursor.  
**Proposed:** Remove `cursor.js` + `cursor.css`; rely on existing `:hover` CSS.  
**Saves ~158 JS + ~180 CSS lines** · Visible design change

---

## Remove / optional trim

| Item                          | Recommendation                                            |
| ----------------------------- | --------------------------------------------------------- |
| Custom cursor + magnetic      | Strongest simplification candidate if visual downgrade OK |
| Theme sweep click-origin      | Drop; keep color transition                               |
| Dead animation keyframes      | Safe CSS deletion                                         |
| `config.js` as content source | **Done** — profile content moved to HTML-first; `config.js` is GitHub + theme metadata only |
| GitHub streak stats           | Optional trim                                             |
| Unused cursor exports         | Remove                                                    |

---

## Recommended simplification PRs (ordered)

### PR 1 — Static content + no-JS baseline ✅ **Complete**

Inline hero, about, skills, timeline, connect, social navs in `index.html`. Hydration removed from `main.js`.

### PR 2 — Static theme switcher + dedupe boot ✅ **Complete**

Theme buttons in HTML; slim `theme.js`; duplicate IIFE removed.

### PR 3 — CSS/JS hygiene (zero behavior change) · **Optional**

Delete unused keyframes; consolidate helpers; remove dead exports.

### PR 4 — Remove cursor effects · **Declined**

~~Delete `cursor.js`, `cursor.css`, `data-magnetic`, `refreshCursorTargets`.~~ **Decision:** keep custom cursor and magnetic effects; improve accessibility (pointer guards, reduced motion) rather than remove. See IMPROVEMENT-PLAN SIM-002.

### PR 5 — GitHub template refactor ✅ **Complete**

`<template>` shells in `index.html` for skeleton, error, dashboard, stats, and contribution graph; `js/github.js` clones templates and binds data via DOM APIs (`textContent` / `setAttribute`).

---

## Anti-patterns to avoid

1. CSS-only theme without persistence — bad return-visit UX
2. Theme controls without `aria-live` announcements
3. `cursor: none` without guards (`pointer: fine`, reduced motion)
4. Empty HTML shells until JS runs — use static content instead
5. `:has()` theme refactor across all theme files — large churn, still need JS for storage
6. `details/summary` for timeline — loses semantic `<ol>`
7. Removing sketch gating in JS while keeping CSS-only hide — broken saved preference
8. Fetching config JSON at runtime — worse than static HTML for this site size

---

## Feature verdict table

| Topic               | Verdict                                                  |
| ------------------- | -------------------------------------------------------- |
| Theme switching     | Static HTML buttons + small JS for storage, meta, gating |
| GitHub dashboard    | **Template refactor complete** (PR5); async fetch unchanged |
| Cursor effects      | **Keep** — removal declined; improve a11y instead          |
| Hero/about/connect  | **Static HTML** (PR1 complete)                               |
| Experience timeline | **Static HTML** (PR1 complete)                               |
| Social links        | **Static HTML** (PR1 complete)                               |
| Live region         | Already minimal (~9 lines) — keep                        |
| Magnetic/parallax   | JS or removal                                            |
| Theme sweep         | CSS animations exist; simplify JS trigger                |
| Scroll reveals      | **Already CSS** — trim dead keyframes only               |

---

## Architecture note

After PR1/PR2, `main.js` boot is minimal:

```js
initTheme();
initCursor();
refreshCursorTargets();
loadGitHubDashboard();
```

Content hydration is gone. Remaining simplification lever: PR3 hygiene. Cursor removal (PR4) is out of scope; GitHub template refactor (PR5) is complete.
