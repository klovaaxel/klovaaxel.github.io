# Portfolio improvement plan

Durable backlog for [axel.eyssen.se](https://axel.eyssen.se). Grounded in the static-site stack: `index.html`, `css/`, `js/`, GitHub Pages deploy.

**Last reviewed:** 2026-06-28

---

## 1. Purpose & how to use this doc

This document captures prioritized improvements discovered through code review (Bugbot, accessibility pass, performance audit). It is meant to survive across Cursor sessions and handoffs.

**When starting work:**

1. Read [docs/IMPROVEMENT-WORKFLOW.md](docs/IMPROVEMENT-WORKFLOW.md) and [docs/UX-PRINCIPLES.md](docs/UX-PRINCIPLES.md).
2. Pick a phase (or a single item by ID).
3. Update the item's checkbox and status in this file when you begin and when you ship.
4. Link PRs or commits in the item notes if helpful.
5. Move shipped items to **Completed** (or mark **Done** inline and mirror in Completed).

**When reviewing:**

- Re-read `index.html`, `js/config.js`, and the affected module before estimating.
- Run local preview: `python3 -m http.server 8080` (see [README.md](README.md)).
- Prefer vertical slices: one ID per PR when possible.

**Top 5 impact (Phase 7 — post-retro hardening, 2026-06):**

| Rank | ID        | Summary                                                       |
| ---- | --------- | ------------------------------------------------------------- |
| 1    | THEME-001 | Single theme boot path; no double-random; no localStorage lie |
| 2    | ENG-005   | Playwright + axe in CI                                        |
| 3    | A11Y-009  | Cursor keyboard mode on focusin, not Tab-only                 |
| 4    | ENG-006   | GitHub load-generation guard tests                            |
| 5    | DOC-002   | Workflow + UX principles + retro doc on disk                  |

Phases 1–6 are complete. Use Phase 7 items for the next improvement pass.

**Update (2026-06-28):** Phases 1–7 complete. See **Phase 8** for the next discovery pass.

---

## 2. Status legend

| Status          | Meaning                                      |
| --------------- | -------------------------------------------- |
| **Not started** | Acknowledged; no implementation yet          |
| **In progress** | Active branch or session work                |
| **Done**        | Shipped to `main` and verified               |
| **Won't fix**   | Consciously deferred; note rationale in item |

Inline markers: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` won't fix

---

## 3. Phased roadmap

| Phase                       | Theme                          | Goal                                   |
| --------------------------- | ------------------------------ | -------------------------------------- |
| **1 — Quick wins**          | Perf, SEO, small UX            | Measurable gains in &lt;1 day          |
| **2 — Robustness**          | Bugs, GitHub, theme            | No crashes; predictable theme behavior |
| **3 — Accessibility depth** | Keyboard, contrast, i18n hints | WCAG-oriented gaps beyond quick wins   |
| **4 — Polish**              | Content, layout, PWA           | Cohesive voice and visual hierarchy    |
| **5 — Engineering**         | Tests, architecture, security  | Maintainability and safe refactors     |

---

## Phase 1 — Quick wins

- [x] **PERF-001** · **P0** · **S** · Lazy-load sketch fonts only when needed  
       **Files:** `index.html`, `js/theme.js`, `css/tokens.css`, `css/sketch.css`  
       **Problem:** Three Google Font families (Atkinson Hyperlegible, Caveat, Patrick Hand) load on every visit via blocking `<link>` in `index.html` lines 20–25. Sketch-only faces should not penalize dark/light/forest/ocean.  
       **Acceptance criteria:**
    - Base theme uses Atkinson (or system stack) without waiting for Caveat/Patrick Hand.
    - Sketch fonts inject when `data-theme="sketch"` is applied (or on first sketch selection).
    - No FOUT flash on repeat sketch visits (optional `link rel="preload"` once loaded).
    - Lighthouse "render-blocking resources" no longer lists sketch families for non-sketch loads.

- [x] **PERF-002** · **P0** · **S** · Stop render-blocking font CSS  
       **Files:** `index.html`  
       **Problem:** Same font `<link>` blocks first paint for all themes.  
       **Acceptance criteria:**
    - Font stylesheet uses `media="print"` + `onload` swap, or `rel="preload"` + async pattern, without breaking font-display behavior.
    - First Contentful Paint improves on throttled 4G (manual or Lighthouse).
    - Works with Phase 1 sketch lazy-load strategy (PERF-001).

- [x] **CONTENT-001** · **P0** · **S** · Open Graph & Twitter Card meta  
       **Files:** `index.html`, `js/config.js`, optionally `js/main.js`  
       **Problem:** No `og:*` or `twitter:*` tags; link previews show generic title/description.  
       **Acceptance criteria:**
    - `og:title`, `og:description`, `og:url`, `og:type`, `og:image` present (image: absolute URL to icon or dedicated share image).
    - `twitter:card` (summary or summary_large_image) + aligned title/description.
    - Values driven from `config` where practical so one edit updates HTML injection.
    - Validates on [opengraph.xyz](https://www.opengraph.xyz/) or Twitter Card validator.

- [x] **PERF-003** · **P1** · **S** · `preconnect` to GitHub API  
       **Files:** `index.html`  
       **Problem:** `github.js` fetches `api.github.com` with no early connection hint.  
       **Acceptance criteria:**
    - `<link rel="preconnect" href="https://api.github.com">` (and `dns-prefetch` fallback if desired) in `<head>`.
    - No duplicate preconnect to origins already listed.

- [x] **UX-001** · **P1** · **S** · Link Hogia via `config.companyUrl`  
       **Files:** `js/main.js`, `js/config.js`  
       **Problem:** `config.companyUrl` exists but hero meta renders company as plain text (`populateStaticContent` builds spans without links).  
       **Acceptance criteria:**
    - Company name in hero meta is a link to `config.companyUrl` when URL is set.
    - Link has accessible name; external link treatment per A11Y-004 if new tab.
    - Experience timeline company names optionally link (same URL)—document choice in PR.

- [x] **CONTENT-003** · **P2** · **S** · Title consistency (HTML vs JS)  
       **Files:** `index.html`, `js/main.js`  
       **Problem:** Static `<title>Axel Karlsson</title>` vs runtime `` `${config.name} — ${config.role}` ``.  
       **Acceptance criteria:**
    - Single source of truth: either static title matches config pattern or `<title>` is set only from JS before paint (inline script) with same format.
    - `meta description` stays aligned with title/headline strategy.

- [x] **A11Y-004** · **P2** · **S** · External link new-tab cues  
       **Files:** `js/main.js`, `js/github.js`, `css/components.css`  
       **Problem:** `target="_blank"` links lack visible or screen-reader indication of new window.  
       **Acceptance criteria:**
    - Pattern: visually hidden "(opens in new tab)" or icon + `aria-label` on external links.
    - Applies to social links, GitHub dashboard links, and company link (UX-001).
    - Email links unchanged.

---

## Phase 2 — Robustness

- [x] **BUG-001** · **P0** · **S** · Preserve sketch preference when `border-shape` unsupported  
       **Files:** `js/theme.js`, `index.html` (inline bootstrap)  
       **Problem:** `setTheme` calls `localStorage.setItem(STORAGE_KEY, resolvedTheme)` (line 47). When saved theme is `sketch` but unsupported, `resolveTheme` returns `dark` and **overwrites** the user's sketch preference.  
       **Acceptance criteria:**
    - Unsupported sketch: UI shows fallback theme; `localStorage` retains `sketch` (or separate `preferredTheme` key).
    - On supported browsers, sketch restores automatically.
    - Inline head script and `theme.js` agree on behavior.

- [x] **BUG-002** · **P0** · **S** · Guard empty GitHub contributions in `buildWeeks`  
       **Files:** `js/github.js`  
       **Problem:** `buildWeeks` reads `contributions[0]` and `contributions[length-1]` without length check—empty API array throws.  
       **Acceptance criteria:**
    - Empty or missing `contributions` renders empty-state UI (stats optional/zero), no uncaught exception.
    - `computeStreaks` handles `[]` safely (returns `{ current: 0, longest: 0 }`).
    - Unit test covers empty array (see ENG-001).

- [x] **BUG-003** · **P1** · **S** · Corrupt `localStorage` theme must not trigger sweep every load  
       **Files:** `js/theme.js`  
       **Problem:** Invalid saved theme resolves to default; if `dataset.theme` was unset on first `setTheme`, `isThemeChange` may be true and fire sweep incorrectly.  
       **Acceptance criteria:**
    - First load with invalid key: applies default silently, no sweep animation.
    - Sweep only on explicit user theme change after init.
    - Invalid keys normalized once; storage optionally repaired.

- [x] **BUG-004** · **P1** · **M** · Cursor parallax vs Connect card scroll animation  
       **Files:** `js/cursor.js`, `css/cursor.css`, `css/animations.css`  
       **Problem:** `cursor.js` sets `--pointer-x/y` on `documentElement`; `cursor.css` applies `transform` to `.profile-card` and `.hero-name`, conflicting with `data-reveal` / flip animations on `#connect`.  
       **Acceptance criteria:**
    - Connect card flip/scroll animation completes without transform fighting parallax.
    - Parallax still works on hero when cursor FX enabled.
    - `prefers-reduced-motion: reduce` disables conflicting transforms (already partially handled).

- [x] **BUG-005** · **P1** · **S** · Theme sweep when leaving sketch theme  
       **Files:** `js/theme.js`, `css/animations.css` (theme sweep styles)  
       **Problem:** Sweep may not run or display correctly when transitioning **from** sketch (e.g. sketch-specific CSS or timing).  
       **Acceptance criteria:**
    - Switching sketch → any other theme plays sweep beam (unless reduced motion).
    - Switching to sketch also sweeps consistently.
    - No stuck `theme-sweeping` class.

- [x] **BUG-006** · **P1** · **S** · Sketch hover styles vs `cursor.css`  
       **Files:** `css/cursor.css`, `css/sketch.css`  
       **Problem:** `.has-cursor-fx` rules override sketch theme hover treatments (e.g. hand-drawn borders, wobble).  
       **Acceptance criteria:**
    - In sketch + cursor FX: interactive hovers match sketch design intent.
    - Specificity or `[data-theme="sketch"]` guards prevent global cursor overrides from winning.
    - Verify theme buttons, social links, contrib cells, profile card.

- [x] **CONTENT-002** · **P0** · **M** · GitHub loading skeleton & retry on error  
       **Files:** `js/github.js`, `css/components.css`  
       **Problem:** Loading is plain text; errors show static message with no retry.  
       **Acceptance criteria:**
    - Skeleton placeholders mirror dashboard layout (avatar, stats, graph grid).
    - Error state includes "Retry" control that re-invokes `loadGitHubDashboard`.
    - `aria-live` announces loading/loaded/error (via `live-region.js`).
    - Optional: exponential backoff or disabled button during fetch.

- [x] **ENG-002** · **P2** · **M** · Consolidate triplicated theme bootstrap  
       **Files:** `index.html` (inline script), `js/theme.js` (`applyEarlyTheme` IIFE), `js/theme.js` (`initTheme`)  
       **Problem:** Theme resolution + meta theme-color logic duplicated three times with subtle differences (`resolveTheme` vs inline sketch check).  
       **Acceptance criteria:**
    - Single shared module or inline snippet imported once; head script stays tiny for FOUC prevention.
    - `config.themes` is sole source for `theme-color` / status bar (no hardcoded map duplication).
    - All BUG-001/003 fixes apply in one place.
    - **Shipped:** `#portfolio-theme-data` JSON in `index.html` is chrome source of truth; inline boot + `config.js` read it; `theme.js` uses `config.themes` only.

---

## Phase 3 — Accessibility depth

- [x] **A11Y-001** · **P0** · **M** · Contribution graph keyboard access  
       **Files:** `js/github.js`, `css/components.css`  
       **Problem:** Graph uses `role="img"` with aggregate `aria-label`; individual cells are non-focusable `<span>` with `title` only—no keyboard probe.  
       **Acceptance criteria:**
    - Interactive grid: `role="grid"` / `role="gridcell"` or focusable buttons with `aria-label` per day.
    - Arrow keys move between cells; Enter/Space announces count + date (tooltip content).
    - Visible focus indicator on cells meets contrast requirements.
    - Screen reader spot-check: day-level contribution count discoverable without mouse.

- [x] **A11Y-002** · **P1** · **M** · Contrast on subtle text tokens  
       **Files:** `css/themes/*.css`, `css/tokens.css`, `css/layout.css`  
       **Problem:** `--color-text-subtle` and `--color-text-muted` may fall below WCAG AA on some themes (forest, ocean, sketch).  
       **Acceptance criteria:**
    - All themes: body text ≥ 4.5:1; large text ≥ 3:1 against respective backgrounds.
    - Section subtitles, timeline periods, footer, contrib legend pass automated contrast check.
    - Document token choices in `css/DESIGN-SYSTEM.md` if adjusted.

- [x] **A11Y-003** · **P2** · **S** · `lang="sv"` on Swedish content  
       **Files:** `js/main.js`, `js/config.js`, `index.html`  
       **Problem:** Page `lang="en"` but experience entries include Swedish role titles (e.g. "Utvecklare", "Gymnasieingenjör").  
       **Acceptance criteria:**
    - Swedish strings wrapped in element with `lang="sv"` (timeline roles/companies or per-field in config).
    - Screen readers pronounce Swedish correctly; page default `lang` remains intentional.
    - Strategy documented for future mixed-language content (UX-004).

---

## Phase 4 — Polish

- [x] **UX-002** · **P1** · **M** · Strengthen Connect section vs GitHub  
       **Files:** `css/components.css`, `css/layout.css`, `css/animations.css`, `index.html`, `js/main.js`  
       **Problem:** GitHub dashboard is visually rich; Connect profile card feels secondary despite being primary CTA for contact.  
       **Acceptance criteria:**
    - Connect section visual weight ≥ GitHub (size, accent, motion, or placement).
    - Clear primary action (email or LinkedIn) above the fold of the section.
    - Design works across all themes including sketch.

- [x] **UX-003** · **P2** · **S** · Hero name scaling on mobile  
       **Files:** `css/components.css`, `css/tokens.css`  
       **Problem:** `.hero-name` uppercase display may overflow or dominate small viewports.  
       **Acceptance criteria:**
    - Name fits common mobile widths (320–390px) without horizontal scroll or clipping.
    - Fluid type (`clamp`) respects design system scale.
    - Sketch theme hand-drawn name variant still legible.

- [x] **UX-004** · **P2** · **M** · Mixed EN/SV content strategy  
       **Files:** `js/config.js`, `js/main.js`, `index.html`, this doc  
       **Problem:** UI chrome is English; résumé content mixes Swedish job titles and institutions with English narrative.  
       **Acceptance criteria:**
    - Document chosen approach: full EN, full SV, or intentional bilingual with rules.
    - Implement minimum: consistent section language per UX decision.
    - Align with A11Y-003 `lang` attributes.

        **Strategy (shipped):** Intentional bilingual — English UI chrome (section titles, nav, CTAs, about copy) with Swedish résumé facts where historically accurate. Swedish job titles, programme names, and institution labels carry `lang="sv"` in static HTML (`index.html` experience timeline). No full-site translation; future SV content follows the same rule: English shell, `lang="sv"` on Swedish strings only.

- [x] **CONTENT-004** · **P2** · **S** · PWA manifest `theme_color` vs runtime theme  
       **Files:** `site.webmanifest`, `js/theme.js`, `index.html`  
       **Problem:** Manifest hardcodes `#0c0c0e`; runtime updates `meta theme-color` per theme but installable PWA chrome stays dark.  
       **Acceptance criteria:**
    - Document limitation OR sync manifest theme with default theme only.
    - If dynamic: note that manifest cannot update client-side; consider build-step or accept static default with comment in manifest.
    - Installed PWA status bar reasonable for majority theme (dark default).

---

## Phase 5 — Engineering

- [x] **ENG-001** · **P1** · **L** · Automated tests for pure functions  
       **Files:** `tests/`, `js/theme.js`, `js/github.js`, `js/html.js`, `package.json`, `.github/workflows/test.yml`  
       **Problem:** No tests for `resolveTheme`, `computeStreaks`, `buildWeeks`, `escapeHtml`.  
       **Acceptance criteria:**
    - Test runner configured (Node built-in test, Vitest, or Bun—minimal deps).
    - Cases: `resolveTheme` (missing, sketch unsupported), `computeStreaks` (empty, streak break), `buildWeeks` (empty, sparse), `escapeHtml` (XSS chars).
    - CI workflow runs tests on PR (extend `.github/workflows/pages.yml` or sibling workflow).

- [x] **ENG-003** · **P2** · **L** · Reduce `innerHTML` templating risk  
       **Files:** `js/github.js`, `js/html.js`  
       **Problem:** Multiple templates use `innerHTML` with interpolated API/config data; `escapeHtml` used inconsistently (e.g. avatar URL, some attrs).  
       **Acceptance criteria:**
    - Audit all `innerHTML` call sites; document which are trusted vs escaped.
    - URLs and user-controlled strings use `escapeHtml` or `textContent` / `createElement`.
    - Consider small `html` tagged-template helper with auto-escape for interpolations.
    - No regression in GitHub dashboard rendering.

- [x] **PERF-004** · **P2** · **M** · Optimize continuous `requestAnimationFrame` cursor loop  
       **Files:** `js/cursor.js`  
       **Problem:** `tick()` runs perpetual rAF even when pointer idle; costs battery on laptops.  
       **Acceptance criteria:**
    - rAF runs when pointer recently moved or magnetic interaction active; pauses after idle timeout.
    - Resume on `mousemove`; no visible cursor lag on fine pointers.
    - Still disabled for coarse pointer and reduced motion.

- [-] **PERF-005** · **P3** · **L** · Split theme CSS loading · **Won't fix**  
   **Files:** `css/base.css`, `js/theme.js`, theme files under `css/themes/`  
   **Problem:** `base.css` `@import`s all five themes upfront (~full palette weight per visit).  
   **Rationale:** Static GitHub Pages site with five small theme files; `@import` keeps FOUC-free theme switching and zero build tooling. Transfer cost is acceptable at current size; lazy per-theme CSS would add switch complexity and flash risk for marginal gain.
  **Acceptance criteria:**
    - Active theme CSS loads first; inactive themes lazy-loaded or merged at build time.
    - No flash of wrong theme colors on switch.
    - Measure transfer size reduction on initial load.

---

## Phase 6 — Consolidation & next sprint (second review, 2026-06-28)

Second pass after Phases 1–5. Focus: doc drift, SEO completion, IA, simplification leftovers, hardening.

### Bugs (new)

- [x] **BUG-007** · **P1** · **S** · Contrib grid arrows skip hidden future cells  
       **Files:** `js/github.js`  
       **Problem:** Arrow keys target week/day coords that map to hidden empty cells (no `gridcell`); focus stuck mid-column.  
       **Fix:** Skip to nearest focusable cell in arrow direction.

- [x] **BUG-008** · **P1** · **S** · Parallel GitHub dashboard fetch race  
       **Files:** `js/github.js`  
       **Problem:** Double Retry (or rapid calls) — slower failed fetch can overwrite successful render.  
       **Fix:** In-flight guard / abort controller / ignore stale responses.

- [x] **BUG-009** · **P2** · **S** · Connect CTA hover lost with cursor FX  
       **Files:** `css/cursor.css`, `css/components.css`  
       **Problem:** Magnetic `transform` on `.connect-cta` overrides hover lift.  
       **Fix:** Removed nested `data-magnetic` on CTA; explicit hover rule in `cursor.css`.

### Docs & content

- [x] **DOC-001** · **P1** · **S** · Align README + audits with HTML-first model  
       **Files:** `README.md`, `SIMPLIFICATION-AUDIT.md`, `js/config.js`  
       **Problem:** README still says edit `config.js` for profile; `config.name`/`role` unused after static HTML migration.

- [x] **CONTENT-005** · **P1** · **S** · Complete social meta + share image
      **Files:** `index.html`, `assets/og-image.svg`, `icons/og-image.png`
      **Problem:** Missing `og:type`, `twitter:title`/`description`; `og:image` is square icon not preview card.

### UX & IA

- [x] **UX-005** · **P2** · **M** · Raise Connect in scroll order  
       **Files:** `index.html`  
       **Fix:** Connect moved before GitHub; hero email CTA added.

- [x] **UX-006** · **P2** · **M** · Dedupe social link markup  
       **Files:** `index.html`  
       **Fix:** Connect uses compact text links; full icon nav stays in hero only.

### Accessibility

- [x] **A11Y-005** · **P2** · **S** · Contrib graph double tab stop  
       **Files:** `js/github.js`, `css/components.css`  
       **Problem:** Scroll region and roving gridcell both `tabindex="0"`.

- [x] **A11Y-006** · **P2** · **M** · Sketch focus rings on irregular controls  
       **Files:** `css/sketch.css`, `css/components.css`  
       **Fix:** High-contrast `focus-visible` rings on links, buttons, theme controls, grid cells.

- [x] **A11Y-007** · **P2** · **M** · Cursor `none` only while active / or remove  
       **Files:** `css/cursor.css`, `js/cursor.js`  
       **Fix:** `using-keyboard` on Tab restores system cursor and hides FX layer; `:focus-visible` cursor fallback.

- [x] **A11Y-008** · **P2** · **S** · Invalid `<dl>` structure in GitHub stats  
       **Files:** `js/github.js`  
       **Problem:** `<div>` wrappers inside `<dl>`.

### Simplification & hygiene

- [x] **SIM-001** · **P3** · **S** · Dead code cleanup  
       **Files:** `js/cursor.js`, `css/animations.css`, `css/tokens.css`  
       **Fix:** Removed unused `.loading`, orphan `nth-child(4)`, `bindMagneticElement`, `--font-mono`.

- [x] **SIM-002** · **P2** · **L** · Remove cursor FX (SIMPLIFICATION PR4) — **Won't fix**; kept with a11y improvements  
       **Files:** `js/cursor.js`, `css/cursor.css`, `index.html`, `js/main.js`  
       **~340 lines removed;** biggest simplification lever left.

- [x] **SIM-003** · **P3** · **M** · GitHub `<template>` refactor (PR5)  
       **Files:** `index.html`, `js/github.js`

- [x] **SIM-004** · **P3** · **S** · Duplicate Connect scroll-flip animation  
       **Files:** `css/animations.css`, `index.html`  
       **Fix:** Removed card-level flip; section `data-reveal="flip"` only.

### Performance & engineering

- [x] **PERF-006** · **P2** · **M** · Cache GitHub API in sessionStorage (TTL)  
       **Files:** `js/github.js`  
       **Fix:** 5-minute sessionStorage cache; Retry bypasses cache.

- [x] **PERF-007** · **P3** · **M** · Self-host or subset Atkinson font  
       **Files:** `index.html`, `css/fonts.css`, `assets/fonts/`  
       **Fix:** Latin-subset woff2 (400/700) self-hosted; Google Fonts Atkinson links removed. Sketch faces still lazy-loaded via `theme.js`.

- [x] **ENG-004** · **P3** · **M** · Grid keyboard + E2E smoke tests  
       **Files:** `tests/`, `.github/workflows/test.yml`  
       **Done:** Static smoke tests in `tests/smoke.test.js`; grid keyboard unit tests. Superseded by **ENG-005** (Playwright + axe).

---

## Phase 7 — Retro hardening (2026-06)

Follow-up from [RETRO-2026-06.md](RETRO-2026-06.md) after the improvement arc and Connect/theme UX pass.

- [x] **THEME-001** · **P1** · **M** · Unify theme bootstrap; remove localStorage drift  
       **Files:** `js/theme-bootstrap.js`, `js/theme-pick.js`, `js/theme.js`, `index.html`, `README.md`  
       **Fix:** Early boot in external sync script; `initTheme()` reads `data-theme` (no re-roll); switcher session-only; stale `localStorage` key cleared on init.

- [x] **A11Y-009** · **P2** · **S** · Cursor keyboard mode on any focusable focusin  
       **Files:** `js/cursor.js`  
       **Fix:** `using-keyboard` on `focusin` for links/buttons/inputs, not Tab-only.

- [x] **ENG-005** · **P2** · **M** · Playwright E2E + axe in CI  
       **Files:** `playwright.config.js`, `tests/e2e/`, `package.json`, `.github/workflows/test.yml`  
       **Fix:** Scroll-at-top, theme switch, axe scan (color-contrast disabled — sketch themes vary).

- [x] **ENG-006** · **P2** · **S** · GitHub load-generation guard tests  
       **Files:** `js/github.js`, `tests/github-load.test.js`  
       **Fix:** Exported `beginGitHubLoad` / `isGitHubLoadCurrent`; unit test for stale-load discard.

- [x] **DOC-002** · **P2** · **S** · Process docs from retro  
       **Files:** `docs/IMPROVEMENT-WORKFLOW.md`, `docs/UX-PRINCIPLES.md`, `RETRO-2026-06.md`  
       **Fix:** Post-merge checklist, contact hierarchy, retro on disk.

- [x] **ENG-007** · **P3** · **M** · Mock-fetch integration test for `loadGitHubDashboard`  
       **Files:** `tests/github-dashboard.integration.test.js`  
       **Done:** DOM fixture + mocked `fetch`; cache hit, bypass cache, stale generation.

- [x] **ENG-008** · **P2** · **S** · Ambient theme guards + visual dev ergonomics  
       **Files:** `css/theme-ambient.css`, `tests/`, `package.json`, `docs/retros/`  
       **Done:** `npm start`, smoke ambient contract, E2E per-theme layer visibility, DESIGN-SYSTEM ambient section. See [docs/retros/2026-06-28-animated-ambient-themes.md](docs/retros/2026-06-28-animated-ambient-themes.md).

---

## Phase 8 — Next discovery pass (not started)

Phases 1–7 are complete (2026-06-28). Do **not** reopen shipped IDs unless regressing.

**To start Phase 8:**

1. Holistic review (code, a11y, UX, perf, content) — one parent pass, not parallel subagents first.
2. File new IDs in this section with acceptance criteria.
3. Run slice retro from [Phase 7 close-out](docs/retros/2026-06-28-phase7-plan-closeout.md) follow-through before picking scope.

**Open product questions** (from [RETRO-2026-06.md](RETRO-2026-06.md)) — candidates for user decision before implementation:

- Remove Connect section vs keep quiet footer echo
- Triple email entry points — intentional redundancy?
- Random theme every load vs first-visit-only

_No Phase 8 items filed yet._

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

| Path                                                         | Role                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| [index.html](index.html)                                     | Shell, meta, font links, theme-bootstrap.js, sections  |
| [js/config.js](js/config.js)                                 | GitHub username, themes (from `#portfolio-theme-data`) |
| [js/theme-bootstrap.js](js/theme-bootstrap.js)               | Sync random theme before first paint                   |
| [js/theme-pick.js](js/theme-pick.js)                         | Shared theme pool helpers                              |
| [docs/IMPROVEMENT-WORKFLOW.md](docs/IMPROVEMENT-WORKFLOW.md) | Post-merge checklist, subagent rules                   |
| [docs/UX-PRINCIPLES.md](docs/UX-PRINCIPLES.md)               | Contact hierarchy, page narrative                      |
| [RETRO-2026-06.md](RETRO-2026-06.md)                         | Improvement arc retrospective                          |
| [js/main.js](js/main.js)                                     | Boot: theme, cursor, GitHub (~10 lines)                |
| [js/theme.js](js/theme.js)                                   | Theme switcher, sweep, browser chrome, switcher UI     |
| [js/github.js](js/github.js)                                 | GitHub API, contributions graph, streaks               |
| [js/cursor.js](js/cursor.js)                                 | Custom cursor, magnetic elements, parallax vars        |
| [js/live-region.js](js/live-region.js)                       | `announceStatus` for assistive tech                    |
| [css/base.css](css/base.css)                                 | Reset, theme imports, skip link                        |
| [css/tokens.css](css/tokens.css)                             | Spacing, typography, layout tokens                     |
| [css/layout.css](css/layout.css)                             | Page structure, sections                               |
| [css/components.css](css/components.css)                     | Hero, GitHub dashboard, contrib graph, cards           |
| [css/animations.css](css/animations.css)                     | Reveals, theme sweep, Connect flip                     |
| [css/cursor.css](css/cursor.css)                             | Cursor FX + parallax transforms                        |
| [css/sketch.css](css/sketch.css)                             | Sketch-only decorative styles                          |
| [css/border-shape.css](css/border-shape.css)                 | `border-shape` progressive enhancement                 |
| [css/themes/](css/themes/)                                   | Per-theme color palettes                               |
| [css/DESIGN-SYSTEM.md](css/DESIGN-SYSTEM.md)                 | Token & theme documentation                            |
| [site.webmanifest](site.webmanifest)                         | PWA metadata                                           |
| [README.md](README.md)                                       | Local dev, deploy, structure                           |
| [.github/workflows/pages.yml](.github/workflows/pages.yml)   | GitHub Pages deploy                                    |
| [js/html.js](js/html.js)                                     | Shared `escapeHtml` for safe templating                |
| [tests/](tests/)                                             | Node built-in unit tests for pure functions            |
| [package.json](package.json)                                 | Test script (`npm test`)                               |
| [.github/workflows/test.yml](.github/workflows/test.yml)     | CI test workflow on push/PR                            |

---

## Changelog

| Date       | Change                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------- |
| 2026-06-28 | ENG-007: mock-fetch integration tests for loadGitHubDashboard (46 tests pass)                 |
| 2026-06-23 | Phase 7: theme boot unification, Playwright+axe CI, workflow docs, retro on disk              |
| 2026-06-28 | Phase 6 complete: GitHub templates, self-hosted fonts, smoke tests (34 tests)                 |
| 2026-06-28 | Phase 6 continued: Connect IA, sketch focus, cache, dead-code cleanup (21 tests)              |
| 2026-06-28 | Phase 6 quick fixes: GitHub grid/race, cursor a11y, SEO meta, docs (17 tests pass)            |
| 2026-06-28 | DOC-001: README, SIMPLIFICATION-AUDIT, and config.js aligned with HTML-first model            |
| 2026-06-28 | Phase 4 polish: Connect prominence, hero mobile scaling, EN/SV strategy, PWA theme_color docs |
| 2026-06-28 | Initial plan from Bugbot, a11y, perf, and content review                                      |
| 2026-06-28 | Phases 1–2 shipped (quick wins, robustness)                                                   |
| 2026-06-28 | Phases 3–5 shipped (a11y depth, polish, engineering); PERF-005 won't fix                      |
