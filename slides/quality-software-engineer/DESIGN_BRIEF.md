# Design & Content Brief — "From QA to QSE" deck

Shared contract for every page file. Read this fully before writing slides. The goal: a clean,
card-based, colorful-accent deck reminiscent of Google Slides/Material Design **in spirit only**
(whitespace, rounded cards, a 4-color accent, sans-serif type) — never copy Google's actual logo,
wordmark, exact brand colors, or the "Google Sans" font. We already use **Inter** for sans and
**JetBrains Mono** for code — keep using those, do not introduce "Google Sans"/"Product Sans" or
the literal word "Google" anywhere in slide content.

## Tech
- Framework: Slidev (`slides.md` is the entry, imports page files via `src: ./pages/xxx.md`).
- Canvas is 1280×720 (16:9), fixed. `.slidev-layout` already has `padding: 2rem 2.5rem; overflow: hidden`
  — content that overflows is **clipped, not scrollable**. Treat every slide as a hard-bounded box.
- Mermaid is built in — just use ```mermaid fenced blocks. Slidev auto-switches the mermaid theme
  with light/dark mode already; do NOT hardcode diagram colors, do NOT set a custom mermaid theme.
- `colorSchema: both` is set — every slide must look correct in both light and dark. Only use the
  CSS custom properties below (they already flip under `.dark`); never hardcode hex colors in
  slide markup.

## Design tokens (already defined in slides.md, use via CSS var or utility class)
```
--qse-primary   #3B82F6 (blue)     --qse-secondary #8B5CF6 (violet)
--qse-red       #EF4444            --qse-yellow    #F59E0B
--qse-green     #10B981            --qse-teal      #14B8A6
--qse-bg / --qse-text / --qse-text-muted / --qse-surface / --qse-surface-2 / --qse-border
--qse-shadow / --qse-radius (12px)
```
Utility classes already available: `.qse-card`, `.qse-badge`, `.qse-text-primary/red/green/yellow/secondary/muted`,
`.qse-bg-primary`, `.qse-bg-surface`, `.qse-bg-surface-2`, `.qse-bar`.

**New utility classes you may rely on (already added to the root `<style>` in slides.md):**
- `.qse-dots` — a row of 4 small accent-colored circles (blue/red/yellow/green) — use once or twice
  per deck as a section-break motif, not on every slide.
- `.qse-eyebrow` — small uppercase kicker label above a title (e.g. "DAY 1 · PLAN").
- `.qse-pill-sdet` / `.qse-pill-qe` — rounded pill badges to tag content as SDET (blue) vs QE (violet).
- `.qse-timeline` / `.qse-timeline-item` — compact horizontal/vertical schedule strip (flex, small
  font, no giant table).

## Hard overflow rules (non-negotiable)
1. One idea per slide. If a section has more than ~6 bullet points or a table with more than ~5 rows,
   **split it into two slides** or convert it to a diagram — never shrink font below `text-sm` to
   force a fit.
2. Prose per slide ≤ ~110 words total (including headings). Prefer short phrases over sentences.
3. Never dump a full data table with 5+ columns onto a slide. Convert schedules/timelines to the
   `.qse-timeline` strip or a Mermaid diagram; convert comparisons to a 2-column card grid; convert
   stage-ownership matrices to a small grid of cards, not a wide table.
4. Code blocks ≤ 8 lines, wrapped, no long unbroken lines.
5. Use Slidev's built-in layouts (`layout: center`, `two-cols`, `image-right`, `quote`, `statement`,
   `section`, `fact`, `default`) instead of hand-rolled absolute positioning.
6. Every slide needs `layout:` set explicitly in its frontmatter (don't rely on the default).

## Making content into diagrams (do this wherever the source is a process/hierarchy/comparison)
- SDLC stage flow → Mermaid `flowchart LR` or `stateDiagram-v2`.
- Order status transitions (PENDING/CONFIRMED/CANCELLED/EXPIRED) → Mermaid `stateDiagram-v2`.
- CI/CD gate logic → Mermaid `flowchart TD` with a decision diamond.
- Role comparison (SDET vs QE) → two-column card grid, not a table.
- Any "before vs after" (As-Is vs To-Be) → two Mermaid flowcharts side by side (`two-cols` layout),
  OR a single flowchart with red/annotated failure point vs green path.
- Schedules → `.qse-timeline` strip, one row per activity, compact.

## Animation / motion
- Use `<v-click>` (or `v-click` attr) to reveal bullet points / cards one at a time on click —
  use it for any list that builds an argument, not decorative reveals everywhere.
- For anything that should feel like a diagram "growing," build it as 2–4 **separate consecutive
  slides** that each add one more node/stage (e.g. slide N shows Plan→Design, slide N+1 shows
  Plan→Design→Develop, etc.) rather than trying to animate inside one Mermaid block.
- Default transition is `transition: slide-left` (set globally in slides.md) — leave as-is unless a
  slide specifically benefits from `transition: fade` (e.g. a full-bleed image or a quote slide).

## Slide frontmatter template
```md
---
layout: default
---

<div class="qse-eyebrow">SECTION · CONTEXT</div>

# Slide Title

content...
```

## Voice
Content is derived from `QA_TO_QSE.md` and `WORKSHOP_QA_TO_QSE_2DAY.md` (project root, one level up
from this deck's folder) and `WORKSHOP_SCHEDULE.md`. Write in English (the source docs mix Thai/English —
translate/condense to English for the deck, keep it plain and workshop-facilitator-friendly, not academic).
Keep the "SDET vs QE" and "shift-left" framing exact — it's the spine of the whole deck.

## File ownership (avoid touching files outside your assignment)
Each page file is owned by one writer. Do not edit `slides.md` itself, `style` blocks, or another
page file. If you need a new small Vue component, put it in `components/` with a distinct name and
say so in your final report — don't touch existing components.
