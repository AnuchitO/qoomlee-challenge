---
layout: center
---

<div class="qse-eyebrow">PRACTICE · SHIFT-LEFT</div>

# Pre-commit: the gate before the gate

<div class="flex flex-col items-center" style="max-width: 820px; margin: 0.5rem auto 0;">

<div style="display: grid; grid-template-columns: repeat(7, auto); align-items: center; justify-items: center; column-gap: 0; row-gap: 8px;">

<div class="qse-loop-card qse-loop-card-sm" style="grid-row:1; grid-column:1; --c: var(--qse-primary); animation-delay: 0.1s;">
<div class="qse-loop-icon" style="width:30px;height:30px;font-size:0.95rem;">✏️</div>
<div class="qse-loop-label" style="font-size:0.72rem;">Edit code</div>
</div>

<svg class="qse-loop-arrow-svg" style="grid-row:1; grid-column:2;" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card qse-loop-card-sm" style="grid-row:1; grid-column:3; --c: var(--qse-secondary); animation-delay: 0.2s;">
<div class="qse-loop-icon" style="width:30px;height:30px;font-size:0.95rem;">💾</div>
<div class="qse-loop-label" style="font-size:0.72rem;">git commit</div>
</div>

<svg class="qse-loop-arrow-svg" style="grid-row:1; grid-column:4;" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card qse-loop-card-sm" style="grid-row:1; grid-column:5; --c: var(--qse-teal); animation-delay: 0.3s;">
<div class="qse-loop-icon" style="width:30px;height:30px;font-size:0.95rem;">🪝</div>
<div class="qse-loop-label" style="font-size:0.72rem;">Pre-commit runs</div>
</div>

<svg class="qse-loop-arrow-svg" style="grid-row:1; grid-column:6;" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-decision-badge qse-anim-in qse-anim-3" style="grid-row:1; grid-column:7;">static checks pass?</div>

<div style="grid-row:2; grid-column:7; display:flex; align-items:flex-start; justify-content:center; gap: 10px;">

<div class="flex flex-col items-center">
<div class="text-xs font-bold" style="color: var(--qse-green);">Yes</div>
<svg class="qse-loop-arrow-svg qse-arrow-v" viewBox="0 0 20 30"><line x1="10" y1="2" x2="10" y2="18" class="qse-flow-line"/><path d="M4 13 L10 20 L16 13" class="qse-flow-head"/></svg>
<div class="qse-card qse-anim-in qse-anim-4" style="border-left: 3px solid var(--qse-green); font-size: 0.75rem; padding: 6px 10px; max-width: 155px; text-align: center;">Commit created — safe to push</div>
</div>

<div class="flex flex-col items-center">
<div class="text-xs font-bold" style="color: var(--qse-red);">No</div>
<svg class="qse-loop-arrow-svg qse-arrow-v" viewBox="0 0 20 30"><line x1="10" y1="2" x2="10" y2="18" class="qse-flow-line"/><path d="M4 13 L10 20 L16 13" class="qse-flow-head"/></svg>
<div class="qse-card qse-anim-in qse-anim-4" style="border-left: 3px solid var(--qse-red); font-size: 0.75rem; padding: 6px 10px; max-width: 155px; text-align: center;">Blocked — nothing committed until it's fixed</div>
</div>

</div>

</div>

</div>

<div class="qse-card mt-2 text-sm" style="max-width: 760px; margin: 0.75rem auto 0;">
<b>Why we need it:</b> Lint, formatting, and secret-scan checks — no test suite involved, just static analysis — run in seconds, on every commit, before the code even leaves your machine. Fixing it here costs nothing; fixing it after a failed CI run or a review comment costs a context-switch — or worse, a shipped bug.
</div>

<div class="text-xs qse-text-muted mt-2 text-center">
Gate 1 of 2 local gates. Next: <b>pre-push</b> — the check that runs before your code reaches the team.
</div>

---
layout: center
---

<div class="qse-eyebrow">PRACTICE · SHIFT-LEFT</div>

# Pre-push: the last local gate

<div class="flex flex-col items-center" style="max-width: 820px; margin: 0.5rem auto 0;">

<div style="display: grid; grid-template-columns: repeat(7, auto); align-items: center; justify-items: center; column-gap: 0; row-gap: 8px;">

<div class="qse-loop-card qse-loop-card-sm" style="grid-row:1; grid-column:1; --c: var(--qse-primary); animation-delay: 0.1s;">
<div class="qse-loop-icon" style="width:30px;height:30px;font-size:0.95rem;">💾</div>
<div class="qse-loop-label" style="font-size:0.72rem;">Commits ready</div>
</div>

<svg class="qse-loop-arrow-svg" style="grid-row:1; grid-column:2;" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card qse-loop-card-sm" style="grid-row:1; grid-column:3; --c: var(--qse-secondary); animation-delay: 0.2s;">
<div class="qse-loop-icon" style="width:30px;height:30px;font-size:0.95rem;">📤</div>
<div class="qse-loop-label" style="font-size:0.72rem;">git push</div>
</div>

<svg class="qse-loop-arrow-svg" style="grid-row:1; grid-column:4;" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card qse-loop-card-sm" style="grid-row:1; grid-column:5; --c: var(--qse-coral); animation-delay: 0.3s;">
<div class="qse-loop-icon" style="width:30px;height:30px;font-size:0.95rem;">🪝</div>
<div class="qse-loop-label" style="font-size:0.72rem;">Pre-push runs</div>
</div>

<svg class="qse-loop-arrow-svg" style="grid-row:1; grid-column:6;" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-decision-badge qse-anim-in qse-anim-3" style="grid-row:1; grid-column:7;">E2E smoke tests pass?</div>

<div style="grid-row:2; grid-column:7; display:flex; align-items:flex-start; justify-content:center; gap: 10px;">

<div class="flex flex-col items-center">
<div class="text-xs font-bold" style="color: var(--qse-green);">Yes</div>
<svg class="qse-loop-arrow-svg qse-arrow-v" viewBox="0 0 20 30"><line x1="10" y1="2" x2="10" y2="18" class="qse-flow-line"/><path d="M4 13 L10 20 L16 13" class="qse-flow-head"/></svg>
<div class="qse-card qse-anim-in qse-anim-4" style="border-left: 3px solid var(--qse-green); font-size: 0.75rem; padding: 6px 10px; max-width: 155px; text-align: center;">Pushed — PR can open</div>
</div>

<div class="flex flex-col items-center">
<div class="text-xs font-bold" style="color: var(--qse-red);">No</div>
<svg class="qse-loop-arrow-svg qse-arrow-v" viewBox="0 0 20 30"><line x1="10" y1="2" x2="10" y2="18" class="qse-flow-line"/><path d="M4 13 L10 20 L16 13" class="qse-flow-head"/></svg>
<div class="qse-card qse-anim-in qse-anim-4" style="border-left: 3px solid var(--qse-red); font-size: 0.75rem; padding: 6px 10px; max-width: 155px; text-align: center;">Blocked — nothing pushed, teammates never see it</div>
</div>

</div>

</div>

</div>

<div class="qse-card mt-2 text-sm" style="max-width: 760px; margin: 0.75rem auto 0;">
<b>Why we need it:</b> Unit tests can't catch integration bugs. A <b>smoke subset of E2E</b> — the slowest, priciest tier — runs once per push instead of once per commit, so it stays fast enough to keep local. It's the last check before your code is visible to anyone else.
</div>

<div class="text-xs qse-text-muted mt-2 text-center">
Not the full E2E suite — that's the CI/CD gate's job. Pre-push runs only the handful of scenarios that must never break.
</div>
