# QA Quick-fill is excluded from production via a build-time env flag

QA Quick-fill (see CONTEXT.md) must never appear in production, so it's gated by
`if (process.env.NEXT_PUBLIC_ENABLE_TEST_SCENARIOS === "true") { <QaQuickFill /> }`
and the flag is left unset in production environments. We verified on Next.js 16.2.6
that when the flag is unset, Next's build pipeline inlines the comparison to a
constant-false expression and Terser/webpack dead-code-eliminate both the branch and
the `QaQuickFill` module — it does not appear in any shipped `.js` bundle (server or
client).

This elimination follows the whole module graph, not just the component: each page's
scenario file (e.g. `app/flights/_qqf/searchScenarios.ts`) is imported only by that
page's `QaQuickFill.tsx`, so once that import becomes unreachable, the scenario file
is dropped too — confirmed by grepping a production build's `.next/server` and
`.next/static` for scenario labels and route codes (e.g. "No results · HKG",
"roundtrip-group-economy") with zero matches. The same gate is applied independently
on the flight search, booking, and payment pages, each with its own `app/<page>/_qqf/`
folder (a Next.js private folder, excluded from routing) containing that page's
`QaQuickFill.tsx` and scenario file. They share a generic `QaQuickFill` UI
(`app/components/_qqf/QuickFillWidget.tsx`), which stays unreachable in production
because every importer is gated — no separate gating is needed per file, as long as
a file is reachable only through a gated `QaQuickFill`'s import chain.

**Caveat**: the eliminated source still appears in `.js.map` source map files in
`.next/server/chunks/ssr/`. This is acceptable as long as source maps aren't shipped
to the deployed environment (they normally aren't for SPA/static deploys). If the
deploy process ever copies `.next/` wholesale or serves source maps publicly, this
would leak the QA Quick-fill source — deploy tooling should exclude `*.map`.
