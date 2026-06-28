---
name: portfolio-improvement-pass
description: >-
    Run improvement passes on axel-portfolio (static HTML/CSS/JS, GitHub Pages).
    Use when iterating the portfolio, implementing IMPROVEMENT-PLAN items, UX/IA
    changes, theme/GitHub/cursor work, subagent reviews, or post-retro fixes on
    axel.eyssen.se.
---

# Portfolio improvement pass

Orchestrates work on this repo. Read linked docs before coding.

## Canonical docs (read first)

| Doc                                                                | When                    |
| ------------------------------------------------------------------ | ----------------------- |
| [IMPROVEMENT-PLAN.md](../../IMPROVEMENT-PLAN.md)                   | Pick scope by plan ID   |
| [docs/IMPROVEMENT-WORKFLOW.md](../../docs/IMPROVEMENT-WORKFLOW.md) | Delegation + post-merge |
| [docs/UX-PRINCIPLES.md](../../docs/UX-PRINCIPLES.md)               | IA, contact hierarchy   |
| [RETRO-2026-06.md](../../RETRO-2026-06.md)                         | Known failure modes     |

## Stack invariants

- **HTML-first** — visible copy in `index.html`; no JS hydration for content
- **No build step** — static files + `npm test` / Playwright only
- **Theme boot** — random in `js/theme-bootstrap.js` (sync head); `initTheme()` reads `data-theme` only; session switcher, no `localStorage`
- **Never `.focus()` on load** — GitHub grid sets tabindex only
- **Custom cursor kept** — mitigate with `using-keyboard` on Tab + `focusin`

## Planning

1. Run `npm test` — baseline green
2. **One plan ID** per PR or subagent
3. UX/IA: map all contact surfaces (hero CTA, social nav, Connect, footer) before reordering
4. If IMPROVEMENT-PLAN has no open items, **say so** — run close-out retro; Phase 8 needs a fresh review pass

## Plan close-out (Phases 1–7 complete)

When the durable backlog is exhausted:

1. Slice retro → `docs/retros/` + update `RETRO-2026-06.md`
2. Do not reopen shipped IDs unless regressing
3. New work → new IMPROVEMENT-PLAN phase after holistic review

See [docs/IMPROVEMENT-WORKFLOW.md](../../docs/IMPROVEMENT-WORKFLOW.md#plan-close-out).

## Delegation

**Subagent owns:** isolated file domains (CSS theme file, single module, doc section)

**Parent owns (never delegate alone):**

- `theme-bootstrap.js` ↔ `theme.js` ↔ `theme-pick.js` alignment
- `github.js` render, cache, generation guard, grid keyboard, focus/scroll
- Hero typography / sizing taste
- IMPROVEMENT-PLAN checkbox + changelog in same commit as code

Subagent prompt must include: file list, `npm test`, constraints above, no commit unless asked.

**Parent after subagent:** `npm run test:all` when seams may be affected (load, focus, theme, GitHub).

## Section order (default)

Hero → About → Experience → GitHub → Connect → Footer

Proof before ask. Connect is quiet echo — not a second hero.

## Test commands

```bash
npm start             # local preview http://localhost:8080
npm test              # unit + HTML smoke (48+)
npm run test:e2e      # scroll, theme, axe
npm run test:all      # CI
python3 -m http.server 8080  # manual preview
```

## Post-merge checklist

Copy from [docs/IMPROVEMENT-WORKFLOW.md](../../docs/IMPROVEMENT-WORKFLOW.md#post-merge-checklist). Minimum:

- [ ] `npm run test:all`
- [ ] No scroll jump on load
- [ ] Theme: no double-random flash
- [ ] Plan checkboxes + README if behavior changed

## Related personal skills

- `multi-session-improvement-pass` — durable backlog, phases, post-batch checklist (any repo)
- `subagent-integration-seams` — parent integration rules (all projects)
- `static-site-testing` — smoke / unit / Playwright layers
- `small-retro` — close-out after a phase ships

## Additional detail

See [reference.md](reference.md) for file map and common pitfalls.
