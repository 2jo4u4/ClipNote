# 0001: Capture and One-Click Copy over DOM Form Injection

## Context & Decision

We initially evaluated building automated DOM form-filling and active-element injection into the browser extension. We decided to explicitly reject automated input injection in favor of a pure **Capture (Quick Modal / Context Menu) and One-Click Copy** architecture, paired with page-centric domain matching and typed sections.

## Why

1. **Robustness over fragility**: Modern SPAs (React 18, Vue 3, Shadow DOM, rich text editors like Slate/Draft) frequently reject synthetic value setting or have complex focus-stealing behavior. Automated injection is unreliable across diverse web forms.
2. **User autonomy**: Users prefer full control over what gets pasted into which form fields, using the Side Panel as an always-accessible snippet drawer with zero-friction clipboard copying.
3. **Architectural simplicity**: Eliminates complex content-script listeners (`focusin`, mutation observers, prototype hijacking), keeping the extension lightweight, secure, and resilient to host page updates.
