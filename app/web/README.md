This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Test Pyramid

Counts below span the whole monorepo (Go services + this frontend), not just
`app/web` — included here because this is where the pyramid's shape is easiest
to reason about end to end. 7 functional layers, plus 3 non-functional
dimensions that sit alongside the pyramid rather than in it.

| #   | Layer                        | Tool                                         | Where                                                                                            | Wired via                   |
| --- | ---------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------- |
| 1   | **Unit**                     | `go test` / Vitest                           | `services/**/*_test.go` (no tag), `lib/**/*.test.ts`                                             | `make test-unit`            |
| 2   | **Component**                | Vitest + Testing Library                     | `app/**/*.test.ts(x)`                                                                            | `make test-frontend`        |
| 3   | **Integration**              | `go test -tags=integration` (testcontainers) | `services/**/*_integration_test.go`                                                              | `make test-integration`     |
| 4   | **Contract (schema-lock)**   | `go test -tags=contract`                     | `flight/contract_test.go`, `booking/contract_test.go`, `payment/booking_client_contract_test.go` | `make test-contract`        |
| 5   | **Contract (cross-service)** | Robot Framework                              | `contract/booking_payment_contract.robot`                                                        | `make check-contract-robot` |
| 6   | **UI (mocked backend)**      | Playwright                                   | `uitests/*.spec.ts`                                                                              | `bun test:ui`               |
| 7   | **E2E (real backend)**       | Playwright                                   | `e2e/payment.spec.ts`                                                                            | `bun test:e2e`              |
| —   | Visual regression            | Playwright screenshots                       | `e2e/visual/` — target exists, no test files yet                                                 | `make test-visual`          |

Outside the pyramid entirely (non-functional): **Performance** (`tests/k6/*.js`,
2 load scripts), **Security** (`make test-security` — ZAP + dependency audit),
**Mutation** (`make test-mutation` — [gremlins](https://gremlins.dev) on both
`qoomlee-service` and `payment-service`, tests the tests rather than the
code).

Also present but **not wired into any script**: `uitests/traditional/payment-traditional.spec.ts`
— 37 cases in one file, the deliberate "before" example from
`docs/stories/demo-story-traditional.md`, kept for teaching contrast against
the pyramid-shaped `e2e/payment.spec.ts`.

### Counts

| Layer                                     |                         Count |
| ----------------------------------------- | ----------------------------: |
| Unit — Go                                 |                           117 |
| Unit — TS (pure functions, `lib/`)        |                            41 |
| Component — TS (`app/`)                   |                           277 |
| Integration — Go                          |                            38 |
| Contract — Go (schema-lock)               |                             5 |
| Contract — Robot (cross-service)          |                             5 |
| UI — Playwright (mocked)                  |                            16 |
| E2E — Playwright (real)                   |                             2 |
| Visual regression                         |                             0 |
| **Wired total**                           |                       **501** |
| _Orphaned: `payment-traditional.spec.ts`_ | _37 (not in the total above)_ |

### Shape

```
                E2E ▏■■  2
                 UI ▏■■■■■■■■■■■■■■■■  16
           Contract ▏■■■■■■■■■■  10   (5 Go + 5 Robot)
        Integration ▏■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■  38
          Component ▏■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■  277
               Unit ▏■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■  158  (117 Go + 41 TS)
```

Base (Unit + Component) = 435 → **87%** of all wired cases. Integration +
Contract + UI + E2E = 66 → 13%, tapering correctly toward the top —
genuinely bottom-heavy, not just in intent.

### Summary

1. **The one real anti-pattern is `payment-traditional.spec.ts`** — 37
   E2E-shaped cases in a single file, structurally an ice-cream cone.
   Intentional (the "traditional" teaching companion) and correctly kept
   **unwired**, so it doesn't distort CI or the counts above — a museum
   piece, not a suite to extend.
2. **Visual regression is a defined layer with zero tests** — `make
test-visual` and `e2e/visual/` are wired up but empty. Either a gap to
   fill or a target to remove if it's not planned near-term.
3. **Component (277) outweighs Go Unit (117)**, driven by a few large files
   (`PaymentClient.test.tsx` ~44, `DateRangePicker.test.tsx` ~38). Not a
   problem on its own — both are base-layer, no-I/O, fast — but worth
   checking whether any of those are testing pure logic through a rendered
   component that could move down into cheaper `lib/` unit tests.
4. **Contract is the thinnest deliberately-covered layer (10)** — reasonable
   for two services; before `booking/contract_test.go` +
   `booking_client_contract_test.go` were added, contract coverage was just
   the one `flight` endpoint.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
