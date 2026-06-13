# QA Quick-fill is excluded from production via a build-time env flag

QA Quick-fill (see CONTEXT.md) must never appear in production, so it's gated by
`if (process.env.NEXT_PUBLIC_ENABLE_TEST_SCENARIOS === "true") { <QaQuickFill /> }`
and the flag is left unset in production environments. We verified on Next.js 16.2.6
that when the flag is unset, Next's build pipeline inlines the comparison to a
constant-false expression and Terser/webpack dead-code-eliminate both the branch and
the `QaQuickFill` module — it does not appear in any shipped `.js` bundle (server or
client).

**Caveat**: the eliminated source still appears in `.js.map` source map files in
`.next/server/chunks/ssr/`. This is acceptable as long as source maps aren't shipped
to the deployed environment (they normally aren't for SPA/static deploys). If the
deploy process ever copies `.next/` wholesale or serves source maps publicly, this
would leak the QA Quick-fill source — deploy tooling should exclude `*.map`.
