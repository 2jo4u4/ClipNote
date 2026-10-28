# Agent Instructions

## Shell & Environment
- Windows host: Always prefix shell commands with `cmd.exe /c "<command>"`.
- Do not execute `.ps1` wrappers directly (PowerShell ExecutionPolicy restriction) and do not use unquoted `&&` in PowerShell.

## Verification
- Before finishing or committing, run: `cmd.exe /c "npm run check"`.
- Production build: `cmd.exe /c "npm run build"`.

## Context Pointers
- Product requirements & specifications: see [SPEC.md](SPEC.md).
- Ubiquitous language & bilingual dictionary: see [GLOSSARY.md](GLOSSARY.md).
- Code quality & reviewer guidelines: see [CODING_STANDARDS.md](CODING_STANDARDS.md).
