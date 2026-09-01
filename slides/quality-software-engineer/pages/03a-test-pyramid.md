---
layout: center
---

<div class="qse-eyebrow">DAY 2 · TEST</div>

# The Test Pyramid

<div class="text-sm qse-text-muted">Five levels of automated testing, manual on top. Left: speed. Right: cost per run.</div>

<div class="flex items-end justify-center gap-4 mt-2" style="max-width: 900px; margin-left: auto; margin-right: auto;">

<div class="flex items-stretch gap-2" style="height: 240px;">
<div style="width: 5px; border-radius: 999px; background: linear-gradient(to top, var(--qse-green), var(--qse-red)); flex-shrink: 0;"></div>
<div style="display: flex; flex-direction: column-reverse; width: 78px;">
<div v-click="1" style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Fastest</div>
<div v-click="2" style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Fast</div>
<div v-click="3" style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Moderate</div>
<div v-click="4" style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Slower</div>
<div v-click="5" style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Slowest</div>
</div>
</div>

<div style="display: flex; flex-direction: column; align-items: center;">

<div v-click="6" style="display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 18px; border-radius: 999px; background: color-mix(in srgb, var(--qse-yellow) 18%, var(--qse-surface)); border: 1px solid color-mix(in srgb, var(--qse-yellow) 40%, var(--qse-border));">
<span style="font-weight: 700; font-size: 0.85rem; color: var(--qse-yellow);">☁️ Manual Test</span>
<span class="text-xs qse-text-muted">exploratory · ad-hoc · slowest & priciest</span>
</div>

<div style="width: 460px; display: flex; flex-direction: column-reverse; gap: 3px; margin-top: 6px;">

<div v-click="1" style="height: 48px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; background: color-mix(in srgb, var(--qse-primary) 22%, var(--qse-surface)); clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);">
<span style="font-weight: 700; font-size: 0.8rem; color: var(--qse-primary);">Unit Test</span>
</div>

<div v-click="2" style="height: 48px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; background: color-mix(in srgb, var(--qse-teal) 22%, var(--qse-surface)); clip-path: polygon(20% 0%, 80% 0%, 90% 100%, 10% 100%);">
<span style="font-weight: 700; font-size: 0.78rem; color: var(--qse-teal);">Component Test</span>
</div>

<div v-click="3" style="height: 48px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; background: color-mix(in srgb, var(--qse-green) 22%, var(--qse-surface)); clip-path: polygon(30% 0%, 70% 0%, 80% 100%, 20% 100%);">
<span style="font-weight: 700; font-size: 0.76rem; color: var(--qse-green);">Contract Test</span>
</div>

<div v-click="4" style="height: 48px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; background: color-mix(in srgb, var(--qse-secondary) 22%, var(--qse-surface)); clip-path: polygon(40% 0%, 60% 0%, 70% 100%, 30% 100%);">
<span style="font-weight: 700; font-size: 0.74rem; color: var(--qse-secondary);">Integration Test</span>
</div>

<div v-click="5" style="height: 48px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; background: color-mix(in srgb, var(--qse-coral) 22%, var(--qse-surface)); clip-path: polygon(50% 0%, 50% 0%, 60% 100%, 40% 100%);">
<span style="font-weight: 700; font-size: 0.78rem; color: var(--qse-coral);">E2E</span>
</div>

</div>

</div>

<div class="flex items-stretch gap-2" style="height: 240px;">
<div style="display: flex; flex-direction: column-reverse; width: 56px;">
<div v-click="1" style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">¢</div>
<div v-click="2" style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">$</div>
<div v-click="3" style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">$$</div>
<div v-click="4" style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">$$$</div>
<div v-click="5" style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">$$$$</div>
</div>
<div style="width: 5px; border-radius: 999px; background: linear-gradient(to top, var(--qse-green), var(--qse-red)); flex-shrink: 0;"></div>
</div>

</div>

<div v-click="7" class="qse-card mt-1 text-sm text-center" style="max-width: 640px; margin: 0.25rem auto 0; padding: 0.4rem 1rem;">
SDET automates Unit → E2E. QE's exploratory testing lives above the pyramid — where automation doesn't reach.
</div>

---
layout: center
---

<div class="qse-eyebrow">DAY 2 · TEST</div>

# Anti-pattern: the ice-cream cone

<div class="text-sm qse-text-muted">Same 5 layers, flipped — most effort where it's slowest and costliest.</div>

<div class="flex items-end justify-center gap-4 mt-1" style="max-width: 900px; margin-left: auto; margin-right: auto;">

<div class="flex items-stretch gap-2" style="height: 240px;">
<div style="width: 5px; border-radius: 999px; background: linear-gradient(to top, var(--qse-green), var(--qse-red)); flex-shrink: 0;"></div>
<div style="display: flex; flex-direction: column-reverse; width: 78px;">
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Fastest</div>
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Fast</div>
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Moderate</div>
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Slower</div>
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-end;" class="text-xs qse-text-muted">Slowest</div>
</div>
</div>

<div style="display: flex; flex-direction: column; align-items: center;">

<v-click>
<div style="display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 24px; border-radius: 999px; background: color-mix(in srgb, var(--qse-red) 20%, var(--qse-surface)); border: 1.5px dashed var(--qse-red);">
<span class="qse-text-red" style="font-weight: 700; font-size: 0.95rem;">☁️ Manual Test</span>
<span class="text-xs qse-text-muted">most effort here — first to get skipped under deadline</span>
</div>
</v-click>

<div style="width: 460px; display: flex; flex-direction: column; gap: 3px; margin-top: 4px;">

<v-click>
<div style="height: 48px; display: flex; align-items: flex-start; justify-content: center; padding-top: 8px; background: color-mix(in srgb, var(--qse-coral) 22%, var(--qse-surface)); clip-path: polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%);">
<span style="font-weight: 700; font-size: 0.8rem; color: var(--qse-coral);">E2E</span>
</div>
</v-click>

<v-click>
<div style="height: 48px; display: flex; align-items: flex-start; justify-content: center; padding-top: 8px; background: color-mix(in srgb, var(--qse-secondary) 22%, var(--qse-surface)); clip-path: polygon(10% 0%, 90% 0%, 80% 100%, 20% 100%);">
<span style="font-weight: 700; font-size: 0.76rem; color: var(--qse-secondary);">Integration Test</span>
</div>
</v-click>

<v-click>
<div style="height: 48px; display: flex; align-items: flex-start; justify-content: center; padding-top: 8px; background: color-mix(in srgb, var(--qse-green) 22%, var(--qse-surface)); clip-path: polygon(20% 0%, 80% 0%, 70% 100%, 30% 100%);">
<span style="font-weight: 700; font-size: 0.72rem; color: var(--qse-green);">Contract Test</span>
</div>
</v-click>

<v-click>
<div style="height: 48px; display: flex; align-items: flex-start; justify-content: center; padding-top: 8px; background: color-mix(in srgb, var(--qse-teal) 22%, var(--qse-surface)); clip-path: polygon(30% 0%, 70% 0%, 60% 100%, 40% 100%);">
<span style="font-weight: 700; font-size: 0.7rem; color: var(--qse-teal);">Component</span>
</div>
</v-click>

<v-click>
<div style="height: 48px; display: flex; align-items: flex-start; justify-content: center; padding-top: 6px; background: color-mix(in srgb, var(--qse-primary) 22%, var(--qse-surface)); clip-path: polygon(40% 0%, 60% 0%, 50% 100%, 50% 100%);">
<span style="font-weight: 700; font-size: 0.62rem; color: var(--qse-primary);">Unit</span>
</div>
</v-click>

</div>

</div>

<div class="flex items-stretch gap-2" style="height: 240px;">
<div style="display: flex; flex-direction: column-reverse; width: 56px;">
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">¢</div>
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">$</div>
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">$$</div>
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">$$$</div>
<div style="height: 48px; display: flex; align-items: center; justify-content: flex-start;" class="text-xs qse-text-muted">$$$$</div>
</div>
<div style="width: 5px; border-radius: 999px; background: linear-gradient(to top, var(--qse-green), var(--qse-red)); flex-shrink: 0;"></div>
</div>

</div>

<v-click>
<div class="qse-card mt-0.5 text-sm text-center qse-text-red" style="max-width: 640px; margin: 0.05rem auto 0; padding: 0.1rem 1rem; line-height: 1.3;">
This is "testing concentrated, back-loaded" — the pattern Day 1's repo exploration exposed. The point at the bottom is Unit — thin, so gaps surface late, in production.
</div>
</v-click>

<v-click>
<div class="text-sm mt-0.5 text-center">
Fix: build the base first — automate Unit before adding more E2E.
</div>
</v-click>
