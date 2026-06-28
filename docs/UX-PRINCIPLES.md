# UX principles — axel-portfolio

Durable product rules from the 2026 improvement arc. Use when planning IA or copy changes.

## Contact hierarchy

| Priority    | Surface                               | Role                                          |
| ----------- | ------------------------------------- | --------------------------------------------- |
| **Primary** | Hero — Email me button + social links | First action for new visitors                 |
| **Proof**   | Experience → GitHub                   | Credibility before repeat asks                |
| **Closing** | Connect — quiet text links            | Optional reminder; must not compete with hero |
| **Footer**  | Copyright                             | No contact duplication required               |

**Rule:** Do not promote Connect above GitHub unless hero contact is removed. One primary action per viewport.

## Page narrative

**Hero → About → Experience → GitHub → Connect → Footer**

- Identity before inventory
- Proof before ask
- Connect is a soft landing, not a second hero

## Interaction

- **Never steal focus on load** — widgets (GitHub grid, carousels) init tabindex without `.focus()`.
- **Theme** — random on each visit; switcher applies for current session only (no `localStorage`).
- **Delight is optional** — cursor FX and sketch theme gate on `pointer: fine` / `border-shape`; core path works without them.

## Typography

- Hero name: two lines (Axel / Karlsson), no mid-word breaks, size to fit viewport (`container-type` on hero).

## When changing layout

1. Sketch contact surfaces (table above).
2. Check mobile scroll depth to primary CTA (hero only).
3. Avoid duplicate Email CTAs with equal visual weight.
