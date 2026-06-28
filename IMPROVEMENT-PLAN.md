# Portfolio improvement plan

Durable backlog for [axel.eyssen.se](https://axel.eyssen.se). Grounded in the static-site stack: `index.html`, `css/`, `js/`, GitHub Pages deploy.

**Last reviewed:** 2026-06-28

---

## 1. Purpose & how to use this doc

This document captures prioritized improvements discovered through code review (Bugbot, accessibility pass, performance audit). It is meant to survive across Cursor sessions and handoffs.

**When starting work:**

1. Pick a phase (or a single item by ID).
2. Update the item's checkbox and status in this file when you begin and when you ship.
3. Link PRs or commits in the item notes if helpful.
4. Move shipped items to **Completed** (or mark **Done** inline and mirror in Completed).

**When reviewing:**

- Re-read `index.html`, `js/config.js`, and the affected module before estimating.
- Run local preview: `python3 -m http.server 8080` (see [README.md](README.md)).
- Prefer vertical slices: one ID per PR when possible.

**Top 5 impact (do these first if choosing ad hoc):**

| Rank | ID | Summary |
| ---- | -- | ------- |
| 1 | PERF-001 / PERF-002 | Defer or split Google Fonts; stop blocking first paint |
| 2 | CONTENT-001 | Open Graph & Twitter Card meta |
| 3 | CONTENT-002 / BUG-002 | GitHub dashboard hardening (empty data, skeleton, retry) |
| 4 | A11Y-001 | Contribution graph keyboard access |
| 5 | BUG-001–006 | Sketch/theme robustness cluster |

---

## 2. Status legend

| Status | Meaning |
| ------ | ------- |
| **Not started** | Acknowledged; no implementation yet |
| **In progress** | Active branch or session work |
| **Done** | Shipped to `main` and verified |
| **Won't fix** | Consciously deferred; note rationale in item |

Inline markers: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` won't fix

---

## 3. Phased roadmap

| Phase | Theme | Goal |
| ----- | ----- | ---- |
| **1 — Quick wins** | Perf, SEO, small UX | Measurable gains in &lt;1 day |
| **2 — Robustness** | Bugs, GitHub, theme | No crashes; predictable theme behavior |
| **3 — Accessibility depth** | Keyboard, contrast, i18n hints | WCAG-oriented gaps beyond quick wins |
| **4 — Polish** | Content, layout, PWA | Cohesive voice and visual hierarchy |
| **5 — Engineering** | Tests, architecture, security | Maintainability and safe refactors |

---

## Phase 1 — Quick wins

- [ ] **PERF-001** · **P0** · **S** · Lazy-load sketch fonts only when needed  
  **Files:** `index.html`, `js/theme.js`, `css/tokens.css`, `css/sketch.css`  
  **Problem:** Three Google Font families (Atkinson Hyperlegible, Caveat, Patrick Hand) load on every visit via blocking `<link>` in `index.html` lines 20–25. Sketch-only faces should not penalize dark/light/forest/ocean.  
  **Acceptance criteria:**
  - Base theme uses Atkinson (or system stack) without waiting for Caveat/Patrick Hand.
  - Sketch fonts inject when `data-theme="sketch"` is applied (or on first sketch selection).
  - No FOUT flash on repeat sketch visits (optional `link rel="preload"` once loaded).
  - Lighthouse "render-blocking resources" no longer lists sketch families for non-sketch loads.

- [ ] **PERF-002** · **P0** · **S** · Stop render-blocking font CSS  
  **Files:** `index.html`  
  **Problem:** Same font `<link>` blocks first paint for all themes.  
  **Acceptance criteria:**
  - Font stylesheet uses `media="print"` + `onload` swap, or `rel="preload"` + async pattern, without breaking font-display behavior.
  - First Contentful Paint improves on throttled 4G (manual or Lighthouse).
  - Works with Phase 1 sketch lazy-load strategy (PERF-001).

- [ ] **CONTENT-001** · **P0** · **S** · Open Graph & Twitter Card meta  
  **Files:** `index.html`, `js/config.js`, optionally `js/main.js`  
  **Problem:** No `og:*` or `twitter:*` tags; link previews show generic title/description.  
  **Acceptance criteria:**
  - `og:title`, `og:description`, `og:url`, `og:type`, `og:image` present (image: absolute URL to icon or dedicated share image).
  - `twitter:card` (summary or summary_large_image) + aligned title/description.
  - Values driven from `config` where practical so one edit updates HTML injection.
  - Validates on [opengraph.xyz](https://www.opengraph.xyz/) or Twitter Card validator.

- [ ] **PERF-003** · **P1** · **S** · `preconnect` to GitHub API  
  **Files:** `index.html`  
  **Problem:** `github.js` fetches `api.github.com` with no early connection hint.  
  **Acceptance criteria:**
  - `<link rel="preconnect" href="https://api.github.com">` (and `dns-prefetch` fallback if desired) in `<head>`.
  - No duplicate preconnect to origins already listed.

- [ ] **UX-001** · **P1** · **S** · Link Hogia via `config.companyUrl`  
  **Files:** `js/main.js`, `js/config.js`  
  **Problem:** `config.companyUrl` exists but hero meta renders company as plain text (`populateStaticContent` builds spans without links).  
  **Acceptance criteria:**
  - Company name in hero meta is a link to `config.companyUrl` when URL is set.
  - Link has accessible name; external link treatment per A11Y-004 if new tab.
  - Experience timeline company names optionally link (same URL)—document choice in PR.

- [ ] **CONTENT-003** · **P2** · **S** · Title consistency (HTML vs JS)  
  **Files:** `index.html`, `js/main.js`  
  **Problem:** Static `<title>Axel Karlsson</title>` vs runtime `` `${config.name} — ${config.role}` ``.  
  **Acceptance criteria:**
  - Single source of truth: either static title matches config pattern or `<title>` is set only from JS before paint (inline script) with same format.
  - `meta description` stays aligned with title/headline strategy.

- [ ] **A11Y-004** · **P2** · **S** · External link new-tab cues  
  **Files:** `js/main.js`, `js/github.js`, `css/components.css`  
  **Problem:** `target="_blank"` links lack visible or screen-reader indication of new window.  
  **Acceptance criteria:**
  - Pattern: visually hidden "(opens in new tab)" or icon + `aria-label` on external links.
  - Applies to social links, GitHub dashboard links, and company link (UX-001).
  - Email links unchanged.

---

## Phase 2 — Robustness

- [ ] **BUG-001** · **P0** · **S** · Preserve sketch preference when `border-shape` unsupported  
  **Files:** `js/theme.js`, `index.html` (inline bootstrap)  
  **Problem:** `setTheme` calls `localStorage.setItem(STORAGE_KEY, resolvedTheme)` (line 47). When saved theme is `sketch` but unsupported, `resolveTheme` returns `dark` and **overwrites** the user's sketch preference.  
  **Acceptance criteria:**
  - Unsupported sketch: UI shows fallback theme; `localStorage` retains `sketch` (or separate `preferredTheme` key).
  - On supported browsers, sketch restores automatically.
  - Inline head script and `theme.js` agree on behavior.

- [ ] **BUG-002** · **P0** · **S** · Guard empty GitHub contributions in `buildWeeks`  
  **Files:** `js/github.js`  
  **Problem:** `buildWeeks` reads `contributions[0]` and `contributions[length-1]` without length check—empty API array throws.  
  **Acceptance criteria:**
  - Empty or missing `contributions` renders empty-state UI (stats optional/zero), no uncaught exception.
  - `computeStreaks` handles `[]` safely (returns `{ current: 0, longest: 0 }`).
  - Unit test covers empty array (see ENG-001).

- [ ] **BUG-003** · **P1** · **S** · Corrupt `localStorage` theme must not trigger sweep every load  
  **Files:** `js/theme.js`  
  **Problem:** Invalid saved theme resolves to default; if `dataset.theme` was unset on first `setTheme`, `isThemeChange` may be true and fire sweep incorrectly.  
  **Acceptance criteria:**
  - First load with invalid key: applies default silently, no sweep animation.
  - Sweep only on explicit user theme change after init.
  - Invalid keys normalized once; storage optionally repaired.

- [ ] **BUG-004** · **P1** · **M** · Cursor parallax vs Connect card scroll animation  
  **Files:** `js/cursor.js`, `css/cursor.css`, `css/animations.css`  
  **Problem:** `cursor.js` sets `--pointer-x/y` on `documentElement`; `cursor.css` applies `transform` to `.profile-card` and `.hero-name`, conflicting with `data-reveal` / flip animations on `#connect`.  
  **Acceptance criteria:**
  - Connect card flip/scroll animation completes without transform fighting parallax.
  - Parallax still works on hero when cursor FX enabled.
  - `prefers-reduced-motion: reduce` disables conflicting transforms (already partially handled).

- [ ] **BUG-005** · **P1** · **S** · Theme sweep when leaving sketch theme  
  **Files:** `js/theme.js`, `css/animations.css` (theme sweep styles)  
  **Problem:** Sweep may not run or display correctly when transitioning **from** sketch (e.g. sketch-specific CSS or timing).  
  **Acceptance criteria:**
  - Switching sketch → any other theme plays sweep beam (unless reduced motion).
  - Switching to sketch also sweeps consistently.
  - No stuck `theme-sweeping` class.

- [ ] **BUG-006** · **P1** · **S** · Sketch hover styles vs `cursor.css`  
  **Files:** `css/cursor.css`, `css/sketch.css`  
  **Problem:** `.has-cursor-fx` rules override sketch theme hover treatments (e.g. hand-drawn borders, wobble).  
  **Acceptance criteria:**
  - In sketch + cursor FX: interactive hovers match sketch design intent.
  - Specificity or `[data-theme="sketch"]` guards prevent global cursor overrides from winning.
  - Verify theme buttons, social links, contrib cells, profile card.

- [ ] **CONTENT-002** · **P0** · **M** · GitHub loading skeleton & retry on error  
  **Files:** `js/github.js`, `css/components.css`  
  **Problem:** Loading is plain text; errors show static message with no retry.  
  **Acceptance criteria:**
  - Skeleton placeholders mirror dashboard layout (avatar, stats, graph grid).
  - Error state includes "Retry" control that re-invokes `loadGitHubDashboard`.
  - `aria-live` announces loading/loaded/error (via `live-region.js`).
  - Optional: exponential backoff or disabled button during fetch.

- [ ] **ENG-002** · **P2** · **M** · Consolidate triplicated theme bootstrap  
  **Files:** `index.html` (inline script), `js/theme.js` (`applyEarlyTheme` IIFE), `js/theme.js` (`initTheme`)  
  **Problem:** Theme resolution + meta theme-color logic duplicated three times with subtle differences (`resolveTheme` vs inline sketch check).  
  **Acceptance criteria:**
  - Single shared module or inline snippet imported once; head script stays tiny for FOUC prevention.
  - `config.themes` is sole source for `theme-color` / status bar (no hardcoded map duplication).
  - All BUG-001/003 fixes apply in one place.

---

## Phase 3 — Accessibility depth

- [ ] **A11Y-001** · **P0** · **M** · Contribution graph keyboard access  
  **Files:** `js/github.js`, `css/components.css`  
  **Problem:** Graph uses `role="img"` with aggregate `aria-label`; individual cells are non-focusable `<span>` with `title` only—no keyboard probe.  
  **Acceptance criteria:**
  - Interactive grid: `role="grid"` / `role="gridcell"` or focusable buttons with `aria-label` per day.
  - Arrow keys move between cells; Enter/Space announces count + date (tooltip content).
  - Visible focus indicator on cells meets contrast requirements.
  - Screen reader spot-check: day-level contribution count discoverable without mouse.

- [ ] **A11Y-002** · **P1** · **M** · Contrast on subtle text tokens  
  **Files:** `css/themes/*.css`, `css/tokens.css`, `css/layout.css`  
  **Problem:** `--color-text-subtle` and `--color-text-muted` may fall below WCAG AA on some themes (forest, ocean, sketch).  
  **Acceptance criteria:**
  - All themes: body text ≥ 4.5:1; large text ≥ 3:1 against respective backgrounds.
  - Section subtitles, timeline periods, footer, contrib legend pass automated contrast check.
  - Document token choices in `css/DESIGN-SYSTEM.md` if adjusted.

- [ ] **A11Y-003** · **P2** · **S** · `lang="sv"` on Swedish content  
  **Files:** `js/main.js`, `js/config.js`, `index.html`  
  **Problem:** Page `lang="en"` but experience entries include Swedish role titles (e.g. "Utvecklare", "Gymnasieingenjör").  
  **Acceptance criteria:**
  - Swedish strings wrapped in element with `lang="sv"` (timeline roles/companies or per-field in config).
  - Screen readers pronounce Swedish correctly; page default `lang` remains intentional.
  - Strategy documented for future mixed-language content (UX-004).

---

## Phase 4 — Polish

- [ ] **UX-002** · **P1** · **M** · Strengthen Connect section vs GitHub  
  **Files:** `css/components.css`, `css/layout.css`, `css/animations.css`, `index.html`, `js/main.js`  
  **Problem:** GitHub dashboard is visually rich; Connect profile card feels secondary despite being primary CTA for contact.  
  **Acceptance criteria:**
  - Connect section visual weight ≥ GitHub (size, accent, motion, or placement).
  - Clear primary action (email or LinkedIn) above the fold of the section.
  - Design works across all themes including sketch.

- [ ] **UX-003** · **P2** · **S** · Hero name scaling on mobile  
  **Files:** `css/components.css`, `css/tokens.css`  
  **Problem:** `.hero-name` uppercase display may overflow or dominate small viewports.  
  **Acceptance criteria:**
  - Name fits common mobile widths (320–390px) without horizontal scroll or clipping.
  - Fluid type (`clamp`) respects design system scale.
  - Sketch theme hand-drawn name variant still legible.

- [ ] **UX-004** · **P2** · **M** · Mixed EN/SV content strategy  
  **Files:** `js/config.js`, `js/main.js`, `index.html`, this doc  
  **Problem:** UI chrome is English; résumé content mixes Swedish job titles and institutions with English narrative.  
  **Acceptance criteria:**
  - Document chosen approach: full EN, full SV, or intentional bilingual with rules.
  - Implement minimum: consistent section language per UX decision.
  - Align with A11Y-003 `lang` attributes.

- [ ] **CONTENT-004** · **P2** · **S** · PWA manifest `theme_color` vs runtime theme  
  **Files:** `site.webmanifest`, `js/theme.js`, `index.html`  
  **Problem:** Manifest hardcodes `#0c0c0e`; runtime updates `meta theme-color` per theme but installable PWA chrome stays dark.  
  **Acceptance criteria:**
  - Document limitation OR sync manifest theme with default theme only.
  - If dynamic: note that manifest cannot update client-side; consider build-step or accept static default with comment in manifest.
  - Installed PWA status bar reasonable for majority theme (dark default).

---

## Phase 5 — Engineering

- [ ] **ENG-001** · **P1** · **L** · Automated tests for pure functions  
  **Files:** new `js/*.test.js` or `tests/`, `js/theme.js`, `js/github.js`, `package.json` (if added)  
  **Problem:** No tests for `resolveTheme`, `computeStreaks`, `buildWeeks`, `escapeHtml`.  
  **Acceptance criteria:**
  - Test runner configured (Node built-in test, Vitest, or Bun—minimal deps).
  - Cases: `resolveTheme` (missing, sketch unsupported), `computeStreaks` (empty, streak break), `buildWeeks` (empty, sparse), `escapeHtml` (XSS chars).
  - CI workflow runs tests on PR (extend `.github/workflows/pages.yml` or sibling workflow).

- [ ] **ENG-003** · **P2** · **L** · Reduce `innerHTML` templating risk  
  **Files:** `js/main.js`, `js/github.js`, `js/theme.js`  
  **Problem:** Multiple templates use `innerHTML` with interpolated API/config data; `escapeHtml` used inconsistently (e.g. avatar URL, some attrs).  
  **Acceptance criteria:**
  - Audit all `innerHTML` call sites; document which are trusted vs escaped.
  - URLs and user-controlled strings use `escapeHtml` or `textContent` / `createElement`.
  - Consider small `html` tagged-template helper with auto-escape for interpolations.
  - No regression in GitHub dashboard rendering.

- [ ] **PERF-004** · **P2** · **M** · Optimize continuous `requestAnimationFrame` cursor loop  
  **Files:** `js/cursor.js`  
  **Problem:** `tick()` runs perpetual rAF even when pointer idle; costs battery on laptops.  
  **Acceptance criteria:**
  - rAF runs when pointer recently moved or magnetic interaction active; pauses after idle timeout.
  - Resume on `mousemove`; no visible cursor lag on fine pointers.
  - Still disabled for coarse pointer and reduced motion.

- [ ] **PERF-005** · **P3** · **L** · Split theme CSS loading  
  **Files:** `css/base.css`, `js/theme.js`, theme files under `css/themes/`  
  **Problem:** `base.css` `@import`s all five themes upfront (~full palette weight per visit).  
  **Acceptance criteria:**
  - Active theme CSS loads first; inactive themes lazy-loaded or merged at build time.
  - No flash of wrong theme colors on switch.
  - Measure transfer size reduction on initial load.

---

## 4. Completed

Shipped features and quick wins—keep for context; do not re-open unless regressing.

- [x] **Skip link** — `.skip-link` to `#main` in `index.html` + focus styles in `css/base.css`
- [x] **`aria-live` for theme & GitHub** — `#live-status` region + `js/live-region.js`; used by `theme.js` and `github.js`
- [x] **Fade-up / reveal scroll animations** — `data-reveal`, `data-stagger` in `css/animations.css`
- [x] **Sketch theme** — `css/themes/sketch.css`, `css/sketch.css`, `css/border-shape.css`, `requiresBorderShape` in config
- [x] **Forest & ocean themes** — `css/themes/forest.css`, `css/themes/ocean.css`, background assets in `assets/`
- [x] **PWA icons & manifest** — `site.webmanifest`, `icons/` (favicon, apple-touch, 192/512)

---

## 5. File reference

| Path | Role |
| ---- | ---- |
| [index.html](index.html) | Shell, meta, font links, early theme script, sections |
| [js/config.js](js/config.js) | Profile, links, themes, GitHub username |
| [js/main.js](js/main.js) | DOM population, social links, boot order |
| [js/theme.js](js/theme.js) | Theme switcher, sweep, localStorage, switcher UI |
| [js/github.js](js/github.js) | GitHub API, contributions graph, streaks |
| [js/cursor.js](js/cursor.js) | Custom cursor, magnetic elements, parallax vars |
| [js/live-region.js](js/live-region.js) | `announceStatus` for assistive tech |
| [css/base.css](css/base.css) | Reset, theme imports, skip link |
| [css/tokens.css](css/tokens.css) | Spacing, typography, layout tokens |
| [css/layout.css](css/layout.css) | Page structure, sections |
| [css/components.css](css/components.css) | Hero, GitHub dashboard, contrib graph, cards |
| [css/animations.css](css/animations.css) | Reveals, theme sweep, Connect flip |
| [css/cursor.css](css/cursor.css) | Cursor FX + parallax transforms |
| [css/sketch.css](css/sketch.css) | Sketch-only decorative styles |
| [css/border-shape.css](css/border-shape.css) | `border-shape` progressive enhancement |
| [css/themes/](css/themes/) | Per-theme color palettes |
| [css/DESIGN-SYSTEM.md](css/DESIGN-SYSTEM.md) | Token & theme documentation |
| [site.webmanifest](site.webmanifest) | PWA metadata |
| [README.md](README.md) | Local dev, deploy, structure |
| [.github/workflows/pages.yml](.github/workflows/pages.yml) | GitHub Pages deploy |

---

## Changelog

| Date | Change |
| ---- | ------ |
| 2026-06-28 | Initial plan from Bugbot, a11y, perf, and content review |
