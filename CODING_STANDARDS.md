# Coding Standards

This document establishes standards enforced during code reviews.

## Mechanical Standards
- **Constant References**: Never hardcode system IDs (e.g. `'SYSTEM_GLOBAL_PAGE'`). Always import and use `SYSTEM_GLOBAL_PAGE_ID` from `../core/types`.
- **Coordinate Tuples**: Multi-property coordinates (e.g. `{ sectionId: string; cellId: string }`) must use the formal domain type `CellTarget` (`src/core/types.ts`).
- **i18n Parity**: When adding or updating translation keys in `src/i18n/types.ts`, both `src/i18n/locales/zh-TW.ts` and `src/i18n/locales/en.ts` must be updated concurrently with matching object structure.

## Judgement Calls & Architectural Patterns
- **Semantic HTML**: External URLs and navigation items must remain semantic `<a>` tags with `target="_blank" rel="noopener noreferrer"`. Do not downgrade to `<div onClick="window.open">`. Use `onClick={(e) => e.stopPropagation()}` when nested in clickable cards.
- **Batch Selection Tree Synchronization**: When selecting a parent container (e.g. a Section), all member items (Cells) must be added to selection. When any child is deselected, the parent container checkbox must be deselected.
- **Raycast Design Tokens**: Modals and palettes must adhere to the design system:
  - Surface: dark `bg-raycast-dark-surface`, light `bg-raycast-light-surface`.
  - Border: `border-white/10` (dark), `border-raycast-light-border` (light).
  - Accents: Amber (`#F59E0B`), Coral (`#FF6363`), Emerald (`#30D158`).
  - Interactive: keyboard shortcut `<kbd>` hints with `Ctrl+Enter` save and `Esc` cancel.
