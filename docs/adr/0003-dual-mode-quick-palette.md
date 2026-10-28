# 0003: Dual-Mode Quick Palette and Source Tracking

## Context & Decision

When capturing information (e.g. addresses from Instagram) or filling out forms (e.g. resumes on job boards), users need both fast capture with context retention and instant search without always having the Side Panel open.

We decided:
1. **Source Tracking on Capture**: Every captured Field and Jot optionally records `sourceUrl` and `sourceTitle` automatically from the active tab.
2. **Dual-Mode Quick Modal (`Alt+N`)**: The in-page floating modal serves both as a capture input and an instant Spotlight/Palette search. Typing a query filters matching fields/jots; pressing arrow keys and Enter copies the value to the clipboard and dismisses the modal for immediate pasting (`Ctrl+V`).
3. **No Automatic Key/Value Heuristics**: Users explicitly choose whether selected text is saved as a Jot (scratchpad) or as a named Field; the system does not attempt AI/heuristic guessing of what constitutes a key versus a value.
