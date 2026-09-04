---
layout: default
---

<div class="qse-eyebrow">CORE THESIS · ROLE</div>

# QSE isn't a 3rd role

<div class="text-sm qse-text-muted">One person, two dimensions fused together.</div>

<div class="grid grid-cols-2 gap-4 mt-4">

<div class="qse-card">
  <span class="qse-pill-sdet">SDET · Automation</span>
  <div class="mt-2 text-sm"><b>Goal:</b> build automated test tooling, shift-left so testing happens sooner</div>
  <div class="mt-2 text-sm"><b>Owns:</b> Test Suite, CI/CD Gate (blocks a bad deploy), Tooling</div>
  <div class="mt-2 text-sm"><b>Measured by:</b> Test Coverage (% of code a test touches), Pass Rate, Pipeline Reliability (does the automation run without breaking)</div>
</div>

<div class="qse-card">
  <span class="qse-pill-qe">QE · Strategy</span>
  <div class="mt-2 text-sm"><b>Goal:</b> design the process that prevents defects reaching customers</div>
  <div class="mt-2 text-sm"><b>Owns:</b> Test Strategy, quality targets, Risk Analysis</div>
  <div class="mt-2 text-sm"><b>Measured by:</b> Defect Escape Rate, Requirement Gaps caught</div>
</div>

</div>

<div class="qse-card mt-4 text-sm">
Shared baseline: <b>Automated Testing</b> — SDET builds the framework, QE targets the riskiest scenarios. The real divide is <b>who owns it</b>, not who touches code. Small teams: one person, both hats.
</div>

---
layout: center
---

<div class="qse-eyebrow">CORE THESIS · SDLC</div>

# The 6-stage loop

<div style="max-width: 980px; margin: 0 auto;">

<div class="qse-loop-row">

<div class="qse-loop-card" style="--c: var(--qse-primary); animation-delay: 0.1s;">
<div class="qse-loop-icon">📋</div>
<div class="qse-loop-label">Plan</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-secondary); animation-delay: 0.2s;">
<div class="qse-loop-icon">🎨</div>
<div class="qse-loop-label">Design</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-teal); animation-delay: 0.3s;">
<div class="qse-loop-icon">💻</div>
<div class="qse-loop-label">Develop</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-red); animation-delay: 0.4s;">
<div class="qse-loop-icon">🧪</div>
<div class="qse-loop-label">Test</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-yellow); animation-delay: 0.5s;">
<div class="qse-loop-icon">🚀</div>
<div class="qse-loop-label">Release</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-green); animation-delay: 0.6s;">
<div class="qse-loop-icon">📡</div>
<div class="qse-loop-label">Monitor</div>
</div>

</div>

<div class="qse-loop-back-track">
<div class="qse-loop-back-arrowhead"></div>
<div class="qse-loop-back-label">↻ feedback</div>
</div>

</div>

<div class="text-sm qse-text-muted mt-4 text-center">
QSE shows up at every stage — this is shift-left in practice, and it's a continuous loop, not a one-time pass.
</div>

---
layout: center
---

<div class="qse-eyebrow">CORE THESIS · SHIFT-LEFT</div>

# Same bug, six different prices

<div class="text-sm qse-text-muted">The later a defect is caught, the more it costs to fix — shift-left means catching it before the price climbs.</div>

<div style="max-width: 780px; margin: 1.75rem auto 0;">

<div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom: 1.1rem;">
<svg viewBox="0 0 60 20" style="width:60px; height:20px; overflow:visible;"><line x1="58" y1="10" x2="12" y2="10" class="qse-flow-line"/><path d="M17 4 L7 10 L17 16" class="qse-flow-head"/></svg>
<span class="qse-text-primary" style="font-weight:800; letter-spacing:0.05em; font-size:0.85rem; text-transform:uppercase;">shift left — catch it before it climbs</span>
</div>

<div class="qse-cost-row">

<div class="qse-cost-col">
<div class="qse-cost-bar" style="--c: var(--qse-primary); height: 18px; animation-delay: 0.05s;"><span class="qse-cost-value">1×</span></div>
<div class="qse-cost-label">📋 Plan</div>
</div>

<div class="qse-cost-col">
<div class="qse-cost-bar" style="--c: var(--qse-secondary); height: 32px; animation-delay: 0.15s;"><span class="qse-cost-value">3×</span></div>
<div class="qse-cost-label">🎨 Design</div>
</div>

<div class="qse-cost-col">
<div class="qse-cost-bar" style="--c: var(--qse-teal); height: 50px; animation-delay: 0.25s;"><span class="qse-cost-value">6×</span></div>
<div class="qse-cost-label">💻 Develop</div>
</div>

<div class="qse-cost-col">
<div class="qse-cost-bar" style="--c: var(--qse-red); height: 78px; animation-delay: 0.35s;"><span class="qse-cost-value">15×</span></div>
<div class="qse-cost-label">🧪 Test</div>
</div>

<div class="qse-cost-col">
<div class="qse-cost-bar" style="--c: var(--qse-yellow); height: 112px; animation-delay: 0.45s;"><span class="qse-cost-value">30×</span></div>
<div class="qse-cost-label">🚀 Release</div>
</div>

<div class="qse-cost-col">
<div class="qse-cost-bar" style="--c: var(--qse-green); height: 150px; animation-delay: 0.55s;"><span class="qse-cost-value">60×</span></div>
<div class="qse-cost-label">📡 Monitor</div>
</div>

</div>

</div>

<div class="text-xs qse-text-muted mt-4 text-center">Illustrative, not a measured stat — the shape is the point: same bug, cheap to fix at Plan, expensive once it's live in Monitor.</div>

---
layout: center
---

<div class="qse-eyebrow">CORE THESIS · GATES</div>

# Gates spread across the whole SDLC

<div class="text-sm qse-text-muted">Not one CI/CD gate at the end — a checkpoint at every stage, each one blocking the next.</div>

<div style="max-width: 980px; margin: 1.75rem auto 0;">

<div class="qse-loop-row">

<div class="qse-loop-card" style="--c: var(--qse-primary); animation-delay: 0.1s;">
<div class="qse-loop-icon">📋</div>
<div class="qse-loop-label">Plan</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-secondary); animation-delay: 0.2s;">
<div class="qse-loop-icon">🎨</div>
<div class="qse-loop-label">Design</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-teal); animation-delay: 0.3s;">
<div class="qse-loop-icon">💻</div>
<div class="qse-loop-label">Develop</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-red); animation-delay: 0.4s;">
<div class="qse-loop-icon">🧪</div>
<div class="qse-loop-label">Test</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-yellow); animation-delay: 0.5s;">
<div class="qse-loop-icon">🚀</div>
<div class="qse-loop-label">Release</div>
</div>

<svg class="qse-loop-arrow-svg" viewBox="0 0 40 20"><line x1="2" y1="10" x2="28" y2="10" class="qse-flow-line"/><path d="M23 4 L33 10 L23 16" class="qse-flow-head"/></svg>

<div class="qse-loop-card" style="--c: var(--qse-green); animation-delay: 0.6s;">
<div class="qse-loop-icon">📡</div>
<div class="qse-loop-label">Monitor</div>
</div>

</div>

<div style="display:flex; justify-content:center; gap:0; margin-top: 4px;">
<div style="width:106px; display:flex; justify-content:center;"><div class="qse-gate-tick"></div></div>
<div class="qse-gate-spacer"></div>
<div style="width:106px; display:flex; justify-content:center;"><div class="qse-gate-tick"></div></div>
<div class="qse-gate-spacer"></div>
<div style="width:106px; display:flex; justify-content:center;"><div class="qse-gate-tick"></div></div>
<div class="qse-gate-spacer"></div>
<div style="width:106px; display:flex; justify-content:center;"><div class="qse-gate-tick"></div></div>
<div class="qse-gate-spacer"></div>
<div style="width:106px; display:flex; justify-content:center;"><div class="qse-gate-tick"></div></div>
<div class="qse-gate-spacer"></div>
<div style="width:106px; display:flex; justify-content:center;"><div class="qse-gate-tick"></div></div>
</div>

<div style="display:flex; justify-content:center; gap:0; margin-top: 4px;">

<div class="qse-gate-chip" style="--c: var(--qse-primary);">Spec &amp; requirement gaps reviewed</div>
<div class="qse-gate-spacer"></div>
<div class="qse-gate-chip" style="--c: var(--qse-secondary);">Gate criteria (pass/fail rules) written down</div>
<div class="qse-gate-spacer"></div>
<div class="qse-gate-chip" style="--c: var(--qse-teal);">Pre-commit + pre-push checks pass</div>
<div class="qse-gate-spacer"></div>
<div class="qse-gate-chip" style="--c: var(--qse-red);">E2E + risk-based scenarios pass</div>
<div class="qse-gate-spacer"></div>
<div class="qse-gate-chip" style="--c: var(--qse-yellow);">CI/CD gate: blocks deploy if red</div>
<div class="qse-gate-spacer"></div>
<div class="qse-gate-chip" style="--c: var(--qse-green);">Escaped-bug RCA feeds back to Plan</div>

</div>

</div>

<div class="text-xs qse-text-muted mt-4 text-center">Six stages, six gates — not one gate at the end. Miss one, and the next stage inherits the gap.</div>

---
layout: default
---

<div class="qse-eyebrow">CORE THESIS · OWNERSHIP</div>

# Who owns what, per stage

<div class="grid grid-cols-3 gap-3 mt-4 text-xs">

<div class="qse-card">
<b>Plan</b>
<div class="mt-1"><span class="qse-pill-qe">QE leads</span> spec/requirement gap review</div>
<div class="mt-1"><span class="qse-pill-sdet">SDET</span> feasibility, test infra</div>
</div>

<div class="qse-card">
<b>Design</b>
<div class="mt-1"><span class="qse-pill-sdet">SDET leads</span> mock strategy (fake services, not real ones)</div>
<div class="mt-1"><span class="qse-pill-qe">QE</span> edge cases, quality targets & gate criteria (pass/fail rules)</div>
</div>

<div class="qse-card">
<b>Develop</b>
<div class="mt-1"><span class="qse-pill-sdet">SDET leads</span> automated unit/integration tests</div>
<div class="mt-1"><span class="qse-pill-qe">QE</span> acceptance criteria review</div>
</div>

<div class="qse-card">
<b>Test</b>
<div class="mt-1"><span class="qse-pill-sdet">SDET</span> full-journey (E2E) + performance tests, automated</div>
<div class="mt-1"><span class="qse-pill-qe">QE</span> risk-based, exploratory testing</div>
</div>

<div class="qse-card">
<b>Release</b>
<div class="mt-1"><span class="qse-pill-sdet">SDET leads</span> CI/CD gate (blocks deploy if tests fail)</div>
<div class="mt-1"><span class="qse-pill-qe">QE</span> gate criteria + sign-off</div>
</div>

<div class="qse-card">
<b>Monitor</b>
<div class="mt-1"><span class="qse-pill-qe">QE leads</span> tracks escaped bugs + RCA (root-cause digging)</div>
<div class="mt-1"><span class="qse-pill-sdet">SDET</span> synthetic monitoring (automated checks in production)</div>
</div>

</div>

---
layout: center
class: text-center
---

<div class="qse-eyebrow">CORE THESIS · TAKEAWAY</div>

# Same baseline, different depth

<div class="text-xl mt-4" style="max-width: 34rem; margin: 0 auto;">
"This is the work that changes — not the people. The same team expands from one row (QA) to the full SDLC (QSE)."
</div>

<div class="text-sm qse-text-muted mt-6">
Automated testing is now the shared floor for both SDET and QE — no longer tied to one track.
</div>
