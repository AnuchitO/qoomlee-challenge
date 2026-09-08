---
layout: two-cols-header
---

<div class="qse-eyebrow">DAY 2 · TEST</div>

# Gherkin: Given / When / Then

<div class="text-sm qse-text-muted">A shared language for QE, SDET, and PM — write the scenario before the code. Payment page, real test cards from this repo.</div>

::left::

<span class="qse-badge" style="background: color-mix(in srgb, var(--qse-green) 16%, transparent); color: var(--qse-green);">✅ Happy path</span>

```gherkin
Scenario: Card payment confirms the booking
  Given a pending booking "QM7X2K" for ฿4,200.00
  When I pay with card "4242 4242 4242 4242"
  Then the booking status becomes "CONFIRMED"
  And I see the confirmation page
```

::right::

<span class="qse-badge" style="background: color-mix(in srgb, var(--qse-red) 16%, transparent); color: var(--qse-red);">❌ Declined</span>

```gherkin
Scenario: Declined card leaves the booking pending
  Given a pending booking "QM7X2K" for ฿4,200.00
  When I pay with card "4111 1111 1111 1111"
  Then I see "The card has insufficient funds."
  And the booking status stays "PENDING"
```

<div class="qse-card mt-3 text-sm" style="max-width: 900px; margin: 0.75rem auto 0;">
This scenario is already automated: <code>app/web/uitests/traveller-searches-books-and-pays.spec.ts</code> drives the happy path with Playwright, real test cards straight from <code>services/payment</code>. QE writes the Gherkin — plain enough for a PM to review — SDET turns each line into a Page Object call. Same collaboration as the Test Pyramid: one scenario, two tiers.
</div>
