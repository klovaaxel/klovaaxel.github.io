# UX principles — axel-portfolio

Durable product rules from the 2026 improvement arc. Use when planning IA or copy changes.

## Contact hierarchy

| Priority    | Surface                               | Role                                                  |
| ----------- | ------------------------------------- | ----------------------------------------------------- |
| **Primary** | Hero — Email me button + social links | First action for new visitors                         |
| **Proof**   | Experience → GitHub                   | Credibility before repeat asks                        |
| **Closing** | Footer — compact text links + tagline | Soft reminder after proof; must not compete with hero |
| **Footer**  | Copyright                             | Legal line only                                       |

**Rule:** One primary action per viewport (hero Email me). Footer and social nav are secondary.

### Email entry points (UX-008 — intentional)

Three `mailto:` links by design — different contexts, not duplicate CTAs with equal weight:

| Location   | Role                                     |
| ---------- | ---------------------------------------- |
| Hero CTA   | Primary — button treatment, icon + label |
| Social nav | Peer to GitHub/LinkedIn — icon row       |
| Footer     | Closing reminder — plain text link       |

Do not add a fourth without updating this table.

## Page narrative

**Hero → About → Experience → GitHub → Footer**

- Identity before inventory
- Proof before ask
- Footer is the soft landing (Connect section removed 2026-06; links merged here)

## Interaction

- **Never steal focus on load** — widgets (GitHub grid, carousels) init tabindex without `.focus()`.
- **Theme** — random on **every full page load**; switcher applies for current session only (no `localStorage`). Product choice confirmed 2026-06 (THEME-002).
- **Delight is optional** — cursor FX and sketch theme gate on `pointer: fine` / `border-shape`; core path works without them.

## Typography

- Hero name: two lines (Axel / Karlsson), no mid-word breaks, size to fit viewport (`container-type` on hero).

## When changing layout

1. Sketch contact surfaces (table above).
2. Check mobile scroll depth to primary CTA (hero only).
3. Avoid a new contact surface with equal visual weight to the hero Email button.
