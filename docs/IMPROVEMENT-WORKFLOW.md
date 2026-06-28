# Improvement workflow

How to run portfolio improvement passes without repeating common failures (see [RETRO-2026-06.md](../RETRO-2026-06.md)).

## Before you start

1. Read [IMPROVEMENT-PLAN.md](../IMPROVEMENT-PLAN.md) and [docs/UX-PRINCIPLES.md](UX-PRINCIPLES.md).
2. Run `npm test` — baseline must pass.
3. For UX/IA changes, map **all contact surfaces** (hero CTA, social nav, Connect, footer) before reordering sections.

## Planning

| Step     | Action                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Review   | One holistic pass (code + a11y + UX) → file items in IMPROVEMENT-PLAN                                   |
| Scope    | **One plan ID per PR or subagent** — do not split one ID across agents                                  |
| Delegate | Subagents own **file domains**; parent owns **integration seams** (JS wiring, focus/scroll, boot order) |

## Implementation

### Subagent prompts must include

- Explicit file list
- “Run `npm test` before finishing”
- Constraints: HTML-first content, cursor FX policy, theme boot policy (see README Themes)
- “Do not commit” unless asked

### Parent owns (never delegate alone)

- `github.js` render + keyboard + cache + focus behavior
- `theme-bootstrap.js` + `theme.js` boot alignment
- Typography / hero sizing taste calls
- IMPROVEMENT-PLAN checkbox + changelog updates in the same commit as code

### After subagents return

- Run **`npm run test:all`** (not unit-only) when changes touch load, focus, theme, or async widgets
- Reconcile integration seams before declaring done — see `subagent-integration-seams`

## Plan close-out

When all phased items are **Done** or **Won't fix**:

1. Tell the user the backlog is exhausted (don't dispatch subagents for phantom work).
2. Run a **slice retro** (`small-retro`); update [RETRO-2026-06.md](../RETRO-2026-06.md) residual section.
3. Encode repeat findings into skills / CI guards (see retro follow-through table below).
4. **Phase 8+** — start a new holistic review; add a fresh section to IMPROVEMENT-PLAN. Do not reopen shipped IDs unless regressing.

## GitHub template sync

Dashboard shells use `<template id="…">` in `index.html` and `cloneTemplate()` in `js/github.js`.

| Artifact | Role |
| -------- | ---- |
| `tests/fixtures/github-template-ids.js` | Canonical id list |
| `tests/github-templates.test.js` | CI guard: fixture ↔ `index.html` ↔ `github.js` |
| `tests/github-dashboard.integration.test.js` | Hand-rolled DOM harness — must include every canonical id |

When adding or renaming a GitHub template: update **all four** in the same commit.

## Post-merge checklist

Run after every batch (human or agent):

- [ ] `npm test` — all unit/smoke tests pass
- [ ] `npm run test:e2e` — browser smoke (scroll at top, hero, theme switch, ambient layers, a11y scan)
- [ ] Load site (`npm start`): **no scroll jump** on first paint
- [ ] Tab into GitHub grid: focus works; page does not jump on load
- [ ] Theme: early boot matches session (no double-random flash)
- [ ] Update IMPROVEMENT-PLAN checkboxes + changelog if shipping plan items
- [ ] README / workflow docs if behavior changed

## Test layers

| Layer  | Command                | Catches                                                     |
| ------ | ---------------------- | ----------------------------------------------------------- |
| Unit   | `npm test`             | Pure helpers, DOM mocks, HTML smoke                         |
| E2E    | `npm run test:e2e`     | Scroll, focus, theme switch, ambient layers, axe violations |
| Manual | Simple Browser / local | Visual typography, sketch theme                             |

## CI

`.github/workflows/test.yml` runs `npm run test:all` (unit + Playwright).

## Agent skills

| Skill                                        | Scope                                                         |
| -------------------------------------------- | ------------------------------------------------------------- |
| `multi-session-improvement-pass`             | Personal — any multi-session improvement arc                  |
| `.cursor/skills/portfolio-improvement-pass/` | This repo — plan IDs, invariants, delegation                  |
| `subagent-integration-seams`                 | Personal — parent owns integration seams                      |
| `static-site-testing`                        | Personal — smoke / unit / E2E layers                          |
| `small-retro`                                | Personal — slice/environment retro + follow-through to skills |

Run a **slice retro** after each phase; encode repeat findings into skills (see `small-retro` → Retro follow-through).

## Retro follow-through (this repo)

| Finding | Artifact |
| ------- | -------- |
| Stack invariants | `.cursor/skills/portfolio-improvement-pass/` |
| Delegation / seams | `subagent-integration-seams` (personal) |
| Test layers | `static-site-testing` (personal) |
| Template drift | `tests/fixtures/github-template-ids.js` + `github-templates.test.js` |
| Phase complete | Slice retro in `docs/retros/` + update `RETRO-2026-06.md` |
