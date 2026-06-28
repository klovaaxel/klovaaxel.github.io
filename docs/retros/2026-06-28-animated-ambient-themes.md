# Retro: Animated ambient theme backgrounds

**Date:** 2026-06-28  
**Scope:** slice — CSS/HTML ambient layers for ocean, forest, dark (space), light (sunny)  
**Branch:** `main` (merged `f4785a9`)  
**Commit:** [f4785a9](https://github.com/klovaaxel/klovaaxel.github.io/commit/f4785a9)

---

## Goal vs outcome

| Planned                                  | Delivered                  |
| ---------------------------------------- | -------------------------- |
| Animate ocean + forest backgrounds       | ✅                         |
| Space + sunny backgrounds for dark/light | ✅                         |
| Scroll with page (not viewport-sticky)   | ✅ (after correction)      |
| User happy before push                   | ✅                         |
| Automated visual regression              | ❌ (manual iteration only) |

**Verdict:** Shipped successfully after ~8 visual iteration rounds. Residual risk: no automated guard for ambient markup/CSS contract or per-theme visibility.

---

## What went well

1. **Vertical slice in one file** — `css/theme-ambient.css` keeps theme CSS files thin; layers toggle via `[data-theme]`.
2. **Local preview loop** — `python3 -m http.server 8080` + user feedback caught scroll/fixed/bubble/contrast issues before push.
3. **Playwright already wired** — `npm run test:all` green at push; CI inherits `webServer` config.
4. **Bundled Phase 7 hardening** — theme bootstrap, E2E, docs landed in same commit without breaking tests.

---

## What didn't go well

1. **Fixed ambient layer** — First implementation pinned backgrounds to viewport; user wanted scroll-synced art.
2. **Bubble spawn coordinates** — All bubbles at document bottom → invisible at top of page; fixed-position “fix” reintroduced viewport stickiness.
3. **Forest edge bleed** — Rotate/sway on full background exposed body color at sides while scrolling.
4. **Light-theme contrast** — Clouds existed but were nearly invisible on cream sky (user asked to add clouds, then to make them apparent).
5. **No `npm start`** — User tried `npm start`; script missing (README documents python only).

---

## Repeat

- For decorative CSS: **clarify scroll model early** (page-absolute vs viewport-fixed vs hybrid).
- **Start contrast higher** on light themes; tune down, not up.
- **Run local server proactively** when shipping visual work; ask user to eyeball before push.
- **Oversize + clip** static background layers; animate overlays, not the full bleed-prone base image.

---

## Token efficiency

| Pattern                                            | Verdict | Notes                                                  |
| -------------------------------------------------- | ------- | ------------------------------------------------------ |
| Single-file `theme-ambient.css` vs per-theme split | Keep    | One place for keyframes; easier iteration              |
| Repeated user correction cycles                    | Change  | Up-front scroll/contrast checklist saves 3–4 rounds    |
| Full file reads of theme CSS                       | Keep    | Justified for first implementation                     |
| No subagents for visual polish                     | Keep    | Parent + user loop was faster than delegation overhead |

---

## Change

| Area           | Change                                                | Type |
| -------------- | ----------------------------------------------------- | ---- |
| Dev ergonomics | `npm start` → static server on 8080                   | B    |
| HTML contract  | Smoke test: `.theme-ambient` + CSS import             | B    |
| Docs           | Ambient layer section in DESIGN-SYSTEM + skill ref    | A    |
| Visual QA      | E2E: each theme shows its ambient layer               | B    |
| Light themes   | Default decorative opacity ≥ 0.85 on pale backgrounds | C    |

---

## Action items

| Priority | Action                                                            | Type | Track                     |
| -------- | ----------------------------------------------------------------- | ---- | ------------------------- |
| P1       | Add `npm start` script                                            | B    | `package.json`            |
| P1       | Smoke: `theme-ambient` contract                                   | B    | `tests/smoke.test.js`     |
| P1       | Document ambient architecture                                     | A    | `css/DESIGN-SYSTEM.md`    |
| P2       | E2E: theme → visible `.ambient-*` layer                           | B    | `tests/e2e/smoke.spec.js` |
| P2       | IMPROVEMENT-PLAN **ENG-008** ambient guards                       | A    | `IMPROVEMENT-PLAN.md`     |
| P3       | Split `theme-ambient.css` by theme if file grows past ~1.5k lines | C    | refactor                  |

---

## Prior action verification (RETRO-2026-06 / Phase 7)

| Prior action            | Expected               | Actual                       | Verdict     |
| ----------------------- | ---------------------- | ---------------------------- | ----------- |
| THEME-001 unified boot  | No double-random flash | Bootstrap + switcher worked  | ✅ Verified |
| ENG-005 Playwright CI   | E2E in CI              | `test:all` passed pre-push   | ✅ Verified |
| ENG-006 load generation | Unit guard             | Tests in commit              | ✅ Verified |
| DOC-002 workflow docs   | Post-merge checklist   | Used before push             | ✅ Verified |
| Local preview in README | Documented             | User hit missing `npm start` | ⏳ Partial  |

---

## Demo

```bash
npm run test:all
npm start   # http://localhost:8080 — cycle theme buttons, scroll each theme
```

Expected: backgrounds scroll with page; ocean bubbles weave upward; forest has mist/leaves/fireflies; light clouds visible; dark stars twinkle.
