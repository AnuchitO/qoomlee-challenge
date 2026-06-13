# QA Quick-fill is excluded from production via a build-time env flag

QA Quick-fill (see CONTEXT.md) must never appear in production, so it's gated by
`if (process.env.NEXT_PUBLIC_ENABLE_TEST_SCENARIOS === "true") { <QaQuickFill /> }`
and the flag is left unset in production environments. We verified on Next.js 16.2.6
that when the flag is unset, Next's build pipeline inlines the comparison to a
constant-false expression and Terser/webpack dead-code-eliminate both the branch and
the `QaQuickFill` module — it does not appear in any shipped `.js` bundle (server or
client).

This elimination follows the whole module graph, not just the component: `searchScenarios.ts`
(`app/flights/_qqf/searchScenarios.ts`) is imported only by `QaQuickFill.tsx`, so once
that import becomes unreachable, `searchScenarios.ts` is dropped too — confirmed by grepping
a production build's `.next/server` and `.next/static` for scenario labels and route codes
(e.g. "No results · HKG", "roundtrip-group-economy") with zero matches. All QQF-only code
lives under `app/flights/_qqf/` (a Next.js private folder, excluded from routing); any
future file added there follows the same rule as long as it's reachable only through
`QaQuickFill`'s import chain — no separate gating is needed per file.

**Caveat**: the eliminated source still appears in `.js.map` source map files in
`.next/server/chunks/ssr/`. This is acceptable as long as source maps aren't shipped
to the deployed environment (they normally aren't for SPA/static deploys). If the
deploy process ever copies `.next/` wholesale or serves source maps publicly, this
would leak the QA Quick-fill source — deploy tooling should exclude `*.map`.
