# Simplification audit — axel-portfolio

Audit of opportunities to simplify the codebase using native HTML and CSS instead of JavaScript, **without losing functionality**.

**Last reviewed:** 2026-06-28  
**Companion doc:** [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md)

---

## Executive summary

**Can we simplify meaningfully? Yes.**

Scroll reveals, hero entrance, theme palettes, and sketch gating already lean on CSS. JavaScript is concentrated in: content hydration from `config.js`, theme persistence/chrome, GitHub API rendering, and cursor/magnetic effects.

| Scenario | Estimated JS reduction |
| -------- | ---------------------- |
| Keep all current behavior | **~25–35%** (~200–280 of ~795 JS lines, excluding `config.js` data) |
| Drop custom cursor + magnetic/parallax | **~45–50%** (+158 lines from `cursor.js`) |

**Not recommended:** CSS-only theme with zero JS — loses `localStorage` persistence, PWA `theme-color` / iOS status bar meta, sketch fallback when `border-shape` is unsupported, and screen-reader theme announcements.

---

## Keep in JavaScript (required)

| Feature | Why JS must stay |
| ------- | ---------------- |
| **GitHub dashboard** (`github.js`) | Async fetches, streak math, week grid, loading/error states |
| **Theme `localStorage`** | CSS cannot persist preference |
| **Early theme boot** (inline `<head>` script) | Prevents flash of wrong theme before paint |
| **`resolveTheme()` / sketch gating** | Saved `sketch` on unsupported browsers must fall back to `dark` |
| **`updateBrowserChrome()`** | `theme-color` and iOS status bar meta are not CSS-only |
| **Live region** (`live-region.js`) | `aria-live` for GitHub load and theme changes |
| **Theme sweep origin** (optional) | Click coordinates for `--sweep-x/y`; can simplify to fixed beam |
| **`refreshCursorTargets()`** | Only if cursor/magnetic effects remain |

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

### 8. GitHub dashboard — keep async, simplify render

**Proposed:** `<template id="github-dashboard-tpl">` + data binding; optional drop of streak stats (~40 lines).  
**Risk:** Low–medium

### 9. Cursor / magnetic — remove or keep

**No faithful CSS-only replacement** for parallax/magnetic/custom cursor.  
**Proposed:** Remove `cursor.js` + `cursor.css`; rely on existing `:hover` CSS.  
**Saves ~158 JS + ~180 CSS lines** · Visible design change

---

## Remove / optional trim

| Item | Recommendation |
| ---- | -------------- |
| Custom cursor + magnetic | Strongest simplification candidate if visual downgrade OK |
| Theme sweep click-origin | Drop; keep color transition |
| Dead animation keyframes | Safe CSS deletion |
| `config.js` as content source | Keep for DX, or move to HTML-first |
| GitHub streak stats | Optional trim |
| Unused cursor exports | Remove |

---

## Recommended simplification PRs (ordered)

### PR 1 — Static content + no-JS baseline
Inline hero, about, skills, timeline, connect, social navs in `index.html`. Remove hydration from `main.js`. **~70–90 lines removed.**

### PR 2 — Static theme switcher + dedupe boot
Theme buttons in HTML; slim `theme.js`; delete duplicate IIFE. **~50–70 lines removed.**

### PR 3 — CSS/JS hygiene (zero behavior change)
Delete unused keyframes; consolidate helpers; remove dead exports.

### PR 4 — Optional: remove cursor effects
Delete `cursor.js`, `cursor.css`, `data-magnetic`, `refreshCursorTargets`. **Largest single win.**

### PR 5 — GitHub template refactor (optional)
`<template>` + simpler binding; optional streak removal.

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

| Topic | Verdict |
| ----- | ------- |
| Theme switching | Static HTML buttons + small JS for storage, meta, gating |
| GitHub dashboard | Must stay async; template refactor optional |
| Cursor effects | Remove entirely or keep as-is — no CSS equivalent |
| Hero/about/connect | **Strong candidate for static HTML** |
| Experience timeline | **Static HTML** |
| Social links | Static duplicate navs or sprite |
| Live region | Already minimal (~9 lines) — keep |
| Magnetic/parallax | JS or removal |
| Theme sweep | CSS animations exist; simplify JS trigger |
| Scroll reveals | **Already CSS** — trim dead keyframes only |

---

## Architecture note

Most simplification opportunity is in the first seven `DOMContentLoaded` calls in `main.js` — not in GitHub or live regions:

```js
populateStaticContent();
renderExperience();
renderSkills();
renderConnectSection();
renderSocialLinks("social-links");
renderSocialLinks("connect-social-links");
initTheme();
initCursor();
loadGitHubDashboard();
```

Items 1–6 are candidates for HTML; 7–8 (theme, cursor) can shrink; GitHub must stay.
