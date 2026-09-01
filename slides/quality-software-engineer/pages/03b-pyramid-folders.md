---
layout: center
---

<div class="qse-eyebrow">DAY 2 · TEST</div>

# Where each layer lives in this repo

<div class="text-sm qse-text-muted">Same 5 tiers, mapped onto this codebase's actual folders.</div>

<div class="qse-timeline mt-3" style="max-width: 900px; margin-left: auto; margin-right: auto;">

<div class="qse-timeline-item is-break">
<div class="time" style="color: var(--qse-yellow);">☁️ Manual</div>
<div>no folder — it's a person, not code. Tracked in <code>SCORECARD.md</code></div>
<div class="qse-text-muted">exploratory</div>
</div>

<div class="qse-timeline-item" style="border-left-color: var(--qse-coral);">
<div class="time" style="color: var(--qse-coral);">E2E</div>
<div><code>app/web/e2e/*.spec.ts</code> + <code>e2e/pages/*.page.ts</code></div>
<div><code>make test-e2e</code></div>
</div>

<div class="qse-timeline-item" style="border-left-color: var(--qse-secondary);">
<div class="time" style="color: var(--qse-secondary);">Integration</div>
<div><code>services/*/**/*_integration_test.go</code> — real Postgres, testcontainers</div>
<div><code>make test-integration</code></div>
</div>

<div class="qse-timeline-item" style="border-left-color: var(--qse-green);">
<div class="time" style="color: var(--qse-green);">Contract</div>
<div><code>services/qoomlee/flight/contract_test.go</code> · <code>scripts/contract/</code></div>
<div><code>make test-contract</code></div>
</div>

<div class="qse-timeline-item" style="border-left-color: var(--qse-teal);">
<div class="time" style="color: var(--qse-teal);">Component</div>
<div><code>app/web/app/**/*.test.tsx</code> — frontend only, renders a component</div>
<div><code>bun run test</code></div>
</div>

<div class="qse-timeline-item" style="border-left-color: var(--qse-primary);">
<div class="time" style="color: var(--qse-primary);">Unit</div>
<div><code>services/*/**/*_test.go</code> · <code>app/web/lib/**/*.test.ts</code></div>
<div><code>make test-unit</code></div>
</div>

</div>

<div class="qse-card mt-3 text-sm" style="max-width: 820px; margin: 0.75rem auto 0;">
<b>Added today:</b> Contract was the one tier without a lightweight, mock-based Go test. <code>services/qoomlee/flight/contract_test.go</code> (build tag <code>contract</code>) now locks the <code>GET /api/flights/:id</code> JSON shape against <code>docs/openapi/qoomlee-service.yaml</code> — run it with <code>make test-contract</code>.
</div>

<div class="text-xs qse-text-muted mt-2 text-center">
Hands-on: pick a folder you haven't opened yet — find one existing test, name which tier it is and why.
</div>
