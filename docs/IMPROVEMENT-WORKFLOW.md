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

## Post-merge checklist

Run after every batch (human or agent):

- [ ] `npm test` — all unit/smoke tests pass
- [ ] `npm run test:e2e` — browser smoke (scroll at top, hero, theme switch, a11y scan)
- [ ] Load site: **no scroll jump** on first paint
- [ ] Tab into GitHub grid: focus works; page does not jump on load
- [ ] Theme: early boot matches session (no double-random flash)
- [ ] Update IMPROVEMENT-PLAN checkboxes + changelog if shipping plan items
- [ ] README / workflow docs if behavior changed

## Test layers

| Layer  | Command                | Catches                                     |
| ------ | ---------------------- | ------------------------------------------- |
| Unit   | `npm test`             | Pure helpers, DOM mocks, HTML smoke         |
| E2E    | `npm run test:e2e`     | Scroll, focus, theme switch, axe violations |
| Manual | Simple Browser / local | Visual typography, sketch theme             |

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
