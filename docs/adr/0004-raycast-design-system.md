# 0004: Raycast-Inspired Design System and Motion Physics

## Context & Decision

Web browser extensions frequently feel disjointed, visually sterile, or sluggish with jarring layout shifts. For a tool designed to accompany active workflows (e.g. resume writing, ambient jotting), the interface must feel warm, tactile, and fluid without creating visual fatigue.

We decided to build the entire UI component system around **Raycast-inspired warm minimalism and silky motion physics**:
1. **Warm Palette Tokens**: Using warm charcoal (`#18181b` - `#1c1c1f`) with fine `border-white/8` borders in dark mode, warm ivory (`#faf9f6`) in light mode, accented by Raycast Coral Red (`#FF6363`) / Warm Amber (`#F59E0B`) and soft Emerald (`#30D158`).
2. **Spring & Ease Transitions**: All layout shifts (sliding tab indicators, section collapses, modal zoom/fade) adhere to Apple/Raycast easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`), eliminating abrupt layout jumps.
3. **Tactile Copy Interactions**: Clicking a value card triggers a physical micro-scale depression (`active:scale-[0.98]`), an emerald glow halo (`ring-emerald-500/25`), and a 1.2-second icon flip from copy to checkmark.
4. **Keyboard-First Navigation**: Lists and palettes feature smooth cursor pill tracking with micro keyboard shortcuts (`kbd` badges) on every item.
