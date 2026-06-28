# Retro: Phase 7 close-out — ENG-007 GitHub integration tests

**Date:** 2026-06-28  
**Scope:** slice — final IMPROVEMENT-PLAN item (ENG-007); Phases 1–7 backlog complete  
**Branch:** `main` (unmerged — local WIP)  
**Plan ID:** ENG-007  
**Subagent:** [phase7-eng007](43992557-cb1c-4298-8a12-d625b73ff65f)

---

## Goal vs outcome

| Planned                                              | Delivered |
| ---------------------------------------------------- | --------- |
| Mock-fetch integration test for `loadGitHubDashboard` | ✅        |
| Cache hit path (no fetch)                            | ✅        |
| Bypass cache path                                    | ✅        |
| Stale generation discard                             | ✅        |
| IMPROVEMENT-PLAN ENG-007 marked done                 | ✅        |
| Committed / pushed                                   | ⏳        |

**Verdict:** Last plan item shipped locally with 46 unit + 5 E2E tests green. Improvement backlog is exhausted except explicit won't-fix items (PERF-005, SIM-002). Next work needs a fresh review pass for Phase 8.

---

## What went well

1. **Plan as source of truth** — Parent read `IMPROVEMENT-PLAN.md` first; only ENG-007 remained; no scope creep.
2. **Correct delegation** — Subagent owned isolated test file; parent verified integration via `npm run test:all`.
3. **No new dependencies** — Hand-rolled DOM fixture matches existing `github.test.js` style; tests run in Node without jsdom.
4. **Generation guard now end-to-end** — ENG-006 unit guard + ENG-007 integration test cover the race that caused BUG-008.
5. **Subagent discipline** — Explicit prompt (file list, acceptance, no commit) worked; parent re-ran full suite.

---

## What didn't go well

1. **Large test harness** — `github-dashboard.integration.test.js` is ~440 lines of DOM mock; template markup drift in `index.html` won't fail until integration test breaks.
2. **Plan exhaustion not obvious upfront** — User asked for "more improvements"; answer was one P3 item, not a new phase list.
3. **Uncommitted slice** — Tests + plan checkbox sit on disk; retro precedes commit by user request.
4. **RETRO-2026-06 stale** — Still listed ENG-007 under residual backlog until this retro.

---

## Repeat

- When IMPROVEMENT-PLAN is nearly empty, **state that explicitly** before dispatching subagents.
- **One plan ID per subagent** — worked; keep for any Phase 8 items.
- **Parent owns verification** — always `npm run test:all` after subagent returns, not `npm test` alone.
- For integration tests on template-heavy UI, **note harness maintenance cost** in the plan item.

---

## Token efficiency

| Pattern                                      | Verdict | Notes                                                                 |
| -------------------------------------------- | ------- | --------------------------------------------------------------------- |
| Subagent for ENG-007 vs parent inline        | Keep    | Isolated 440-line harness; parent synthesis + verify was lean         |
| Parent read plan + skill + workflow first    | Keep    | Avoided rediscovering invariants                                      |
| Full `github.js` read before dispatch        | Keep    | Informed subagent prompt with flow + template IDs                     |
| Re-summarizing subagent output               | Change  | Forward Done bullets only (#token — concise-delegation rule applies)  |
| Hand-rolled DOM vs jsdom devDependency         | Keep    | Zero deps aligns with static-site stack                               |

---

## Change

| Area              | Change                                                                 | Type |
| ----------------- | ---------------------------------------------------------------------- | ---- |
| Plan close-out    | When all phases done, run slice retro + update RETRO residual section  | C    |
| Template drift    | Document: integration harness mirrors template IDs — update both       | A    |
| Phase 8           | New review pass → new IMPROVEMENT-PLAN section; don't reopen shipped   | C    |
| GitHub load path  | ENG-007 integration test in CI via `tests/*.test.js` glob              | B    |

---

## Action items

| Priority | Action                                                         | Type | Track                                      | Status   |
| -------- | -------------------------------------------------------------- | ---- | ------------------------------------------ | -------- |
| P1       | Commit ENG-007 slice (test + plan + retro)                     | C    | git                                        | pending  |
| P1       | Update `RETRO-2026-06.md` residual backlog (ENG-007 done)      | A    | `RETRO-2026-06.md`                         | ✅ done  |
| P2       | Template contract: fixture + `github-templates.test.js`        | B    | `tests/fixtures/`, `tests/github-templates.test.js` | ✅ done  |
| P2       | Plan close-out + Phase 8 guidance in workflow/skills           | A/C  | `IMPROVEMENT-WORKFLOW.md`, skills          | ✅ done  |
| P3       | Phase 8 discovery — holistic review if user wants more work    | C    | `IMPROVEMENT-PLAN.md` Phase 8              | scaffold |

---

## Prior action verification (ambient retro 2026-06-28)

| Prior action              | Expected                    | Actual                          | Verdict     |
| ------------------------- | --------------------------- | ------------------------------- | ----------- |
| P1 `npm start`            | Local preview script        | `package.json` has `npm start`  | ✅ Verified |
| P1 smoke ambient contract | HTML + CSS import           | `tests/smoke.test.js`           | ✅ Verified |
| P1 DESIGN-SYSTEM ambient  | Documented scroll model     | Section present                 | ✅ Verified |
| P2 E2E per-theme layer    | Playwright visibility       | `test:all` green                | ✅ Verified |
| ENG-008 plan item         | Guards + ergonomics shipped | Done in `ff34f61`               | ✅ Verified |

---

## Demo

```bash
npm run test:all
# Expected: 46 unit/smoke + 5 E2E pass; includes loadGitHubDashboard integration suite
node --test tests/github-dashboard.integration.test.js
```
