TDD Mobile Migration: Remaining Phases

Scope

- Continue strict TDD: propose tests first, run to RED, implement minimal GREEN, refactor only when green.
- Keep functions ≤10 lines, avoid premature abstractions, and prefer role/label selectors; use data-testid only when necessary.

Phase 3 — Cart Drawer/Page

- Goals
  - Mobile cart open/close via button, no horizontal overflow, tap targets ≥44px, ESC/overlay close, focus trap, checkout CTA visible.
- RED (propose tests first)
  - e2e/cart.mobile.spec.ts
    - Opens cart (button or icon).
    - Adjusts quantity (if supported) and asserts no horizontal overflow.
    - Verifies checkout CTA visible/enabled.
    - Overlay/ESC closes cart; focus returns to trigger.
  - a11y: extend e2e/a11y.spec.ts to include the cart state (after open).
- GREEN (minimal)
  - Implement/ensure cart drawer markup with aria attributes (role="dialog", aria-modal, labelledby).
  - Lock body scroll while drawer open; restore on close.
  - Ensure buttons meet target sizes and visible focus outlines.
- REFACTOR (after green)
  - Extract tiny helpers for body scroll lock and ESC handler.
  - Replace text-based selectors with stable roles or data-testid if needed.

Phase 4 — Checkout Forms

- Goals
  - Single-column mobile layout, readable labels and errors, no clipped inputs, submit CTA visible.
- RED (propose tests first)
  - e2e/checkout.mobile.spec.ts
    - Fill minimal valid data; ensures submit is on-screen and enabled.
    - Induce validation errors; errors must be associated with fields and visible.
    - No horizontal overflow before/after validation.
  - Unit tests (Vitest + RTL)
    - Field-level validation logic (pure JS), error mapping, required fields.
- GREEN (minimal)
  - CSS: responsive grid → single column under BP_MD; ensure inputs/buttons are full-width with adequate spacing.
  - Markup: associate labels (for/id), aria-invalid, aria-describedby linking to error text.
- REFACTOR (after green)
  - Extract error presentation component; keep per-function logic ≤10 lines.

Phase 5 — Footer, Dialogs, Modals

- Goals
  - Mobile-friendly dialogs with focus trap and ESC/overlay close; footer never causes overflow.
- RED (propose tests first)
  - e2e/dialogs.mobile.spec.ts
    - Open a representative dialog; assert focus trap, ESC/overlay close, and no overflow when open.
  - e2e/responsive.spec.ts
    - Add footer visibility/no-overflow assertion at mobile.
- GREEN (minimal)
  - Ensure dialog container sizes to viewport; prevent off-screen content horizontally; add focus trap if missing.
- REFACTOR
  - Centralize dialog a11y wiring in one component to avoid duplication.

Phase 6 — Product/Detail Media & Assets

- Goals
  - Images/video are responsive; no fixed widths that cause overflow.
- RED
  - e2e/media.responsive.spec.ts: asserts images and video players fit viewport width and do not create horizontal scroll.
- GREEN
  - CSS: `img, video { max-width: 100%; height: auto; }` for any component not already covered.
  - Ensure aspect-ratio or container constraints for cards and media blocks.
- REFACTOR
  - Extract a shared media class or utility.

Phase 7 — Accessibility Tightening

- Goals
  - Remove temporary axe allowances (button-name, image-alt) route-by-route as we fix content.
- RED
  - Update e2e/a11y.spec.ts to fail on those rules for each route after fixes are proposed.
- GREEN
  - Provide alt text for decorative images (empty alt) or meaningful descriptions; ensure all actionable buttons have accessible names.
- REFACTOR
  - Add linting rule or CI step to prevent regression (optional).

Phase 8 — Visual Regression (Optional, Targeted)

- Goals
  - Catch layout regressions on key components.
- RED
  - e2e/visual.spec.ts: capture snapshots for header, product grid, cart drawer at mobile and tablet (mask dynamic regions).
- GREEN
  - Stabilize minor dynamic content (e.g., disable animations in test mode).
- REFACTOR
  - Keep snapshot regions small and purposeful to avoid flakiness.

Phase 9 — CI Gate and Developer Ergonomics

- Goals
  - Run mobile e2e on PRs that touch frontend; publish HTML report artifacts.
- Steps
  - Add CI job: `just e2e-mobile` using the Playwright Docker image.
  - Cache pnpm store; pin Playwright versions (already pinned).
  - Document commands in TESTING.md and AGENTS.md (link to Just recipes).

General TDD Protocol per Phase

- Propose tests with code first; wait for approval.
- Run tests (Docker) to confirm RED for right reasons.
- Implement minimum changes to pass; avoid extra features.
- Refactor with tests green; keep functions ≤10 lines.
- Prefer roles/labels; add `data-testid` only for ambiguous CTAs.
