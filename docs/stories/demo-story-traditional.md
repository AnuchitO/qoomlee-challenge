# Demo story: Pay for a Booking — the "traditional" way

> Companion to [`demo-story.md`](./demo-story.md). Same story, same 36 cases,
> same wording — but instead of routing each case to the layer that's
> cheapest to prove it at, this version answers "how do we know this works?"
> with **one tool, every time: a real browser, driving the real page,
> against Playwright.**
>
> That's not a strawman. It's how most teams *start* — write the story,
> open Playwright, drive the UI through every branch you can think of. The
> pyramid in `demo-story.md` is what you get by deliberately routing work
> away from this default. This doc is the "why bother" case for that
> routing, made concrete instead of asserted.
>
> Every case below is implemented and **passing** in
> `app/web/e2e/traditional/payment-traditional.spec.ts` — one single spec
> file, on purpose (see below) — not illustrative snippets like some of the
> code in `demo-story.md`, real specs. Run them:
>
> ```
> cd app/web && npx playwright test e2e/traditional
> ```
>
> The workshop exercise: read the two docs side by side, then refactor
> `payment-traditional.spec.ts` yourself — pushing each case down to the
> layer `demo-story.md` puts it at, and splitting it back into files by
> layer as you go — and watch the suite get faster, more precise, and much
> less repetitive in the process.

## Why one file

The five layer-named files this doc originally shipped with
(`01-e2e-happy-path.spec.ts` … `05-unit-ts-pure-functions.spec.ts`) are now
merged into a single `payment-traditional.spec.ts`, five `test.describe`
blocks deep. That's deliberately *more* honest about the anti-pattern: a
real "traditional" suite doesn't arrive pre-sorted into files that hint at
the pyramid layer each case secretly belongs to — it's one growing spec file
that everyone adds "just one more test" to. Splitting it by layer *is* the
refactor this workshop is asking you to do; starting from one file means the
before/after is an actual before/after, not a relabeling. (`support.ts`
stays a separate file — shared plumbing, not a test.)

## The same 36 cases, all filed under one layer

| Layer in `demo-story.md` | Cases | Here, filed as | Section in `payment-traditional.spec.ts` |
|---|---|---|---|
| E2E | 2 | E2E (no change — these already belonged here) | §1 "E2E cases (identical to the pyramid version)" |
| Component | 12 | E2E | §2 "Component-layer cases, forced through the browser" |
| Contract | 4 new | E2E | §3 "Contract-layer cases, forced through the browser" |
| Unit (Go) | 11 | E2E | §4a "Go-service-logic cases, forced through the browser" |
| Unit (TS) | 7 (1 deferred) | E2E | §4b "TS-pure-function cases, forced through the browser" |

**36 cases, 37 Playwright tests (one `describe` per section, one deferred
`test.skip`), 1 tool, 1 file.** Every test opens a browser page and waits on
real renders; none of it is free.

---

## 1. E2E cases — no change

`demo-story.md`'s two E2E cases were already end-to-end. "Traditional"
thinking doesn't touch them — they're reproduced verbatim in §1 only so this
file's case count is complete. Nothing below applies to them.

---

## 2. What the other 34 cases cost, forced through the browser

### 2.1 You can't call a function — you can only watch a screen

`demo-story.md`'s TS unit cases test five pure functions
(`formatCountdown`, `formatDeparture`, `formatCardNumber`, `formatExpiry`,
`formatCvv`) by importing and calling them. A Playwright test can't import
them — the only way to observe what they return is to type into a field (or
wait for a render) and read the *formatted DOM text* back out. Every one of
those cases in §4b pays for a full page load plus a mocked network
round-trip just to prove what is, underneath, one line of string
manipulation.

Two of them get worse than slow — they get **misleading**:

- **`formatCountdown(65)`** needs the exact wall-clock second the countdown
  renders on, or the assertion is flaky by construction (page-load latency
  eats into the 65 seconds before you get to read it). The fix is
  Playwright's clock-mocking API — and getting that fix *right* took two
  tries. The first pass used `page.clock.install({ time })`, which only
  seeds the clock's starting instant; it still ticks at real wall-clock
  speed after that, so the countdown happily decremented while the dev
  server compiled the page — a genuinely flaky test in ~50% of runs, caught
  only by running it a couple dozen times in a loop. `page.clock.pauseAt()`
  is what actually freezes it. Either way, this is a lot of machinery
  (correctly-used or not) to pin down a function that was already 100%
  deterministic on its own — see the comment on that test for the full
  story.
- **`formatCvv`** sits behind an `<input maxLength={4}>`. Typing
  `"1a2b3c4d5"` key-by-key, the *native HTML attribute* discards most of the
  non-digit characters before `formatCvv` ever sees them — the test happens
  to land on `"1234"`, the same answer the pure function would give, but
  for the wrong reason. Swap the fixture string and it can silently pass or
  fail on an unrelated part of the page. See the comment on that test for
  the full trace. A unit test has no such ambiguity: it calls
  `formatCvv("1a2b3c4d5")` once, gets one deterministic answer.

**A finding these executable tests surfaced that `demo-story.md`'s own
illustrative code didn't catch:** its `formatCardNumber` example (§4b,
"Example — formatting helpers") asserts
`formatCardNumber("4242-4242 4242424299999") === "4242 4242 4242 4299"`.
Run the real function against that exact input and you get
`"4242 4242 4242 4242"` — the `"9999"` tail is past the 16-digit cut, so
it's dropped, not kept. That assertion was never run, so it was never
falsified. This suite's version uses a fixture where the truncation is
unambiguous instead — see its comment. This, and the clock bug above, are
the strongest argument in this doc for *executable* tests over illustrative
code blocks: both bugs shipped silently in code nobody ran, and both were
caught the moment something actually ran it.

### 2.2 Backend branches collapse into "some HTTP status came back"

`demo-story.md`'s 11 Go cases (`service_test.go`) each stub a different
collaborator failure and assert a distinct Go type or call — `ErrAlreadyPaid`
vs. `ErrBookingExpired` vs. `*FailedError`, `ConfirmBooking` called or not,
the exact `PaymentID` it was called with. A browser only ever sees the HTTP
response `payment-service` sends back. So in §4a:

- **Assertions are simply dropped.** "the gateway was never called", "the
  row was inserted as FAILED", "ConfirmBooking was called with this exact
  PaymentID" — none of that is observable from a page. Every test says so
  in a comment where an assertion goes missing.
- **Three separate cases become the identical test.** `repo.GetByBookingRef`
  erroring, `omise.CreateCharge` erroring, and `repo.Insert` erroring on the
  success path are three different Go branches with three different root
  causes — and three identical Playwright tests, because all three just
  mock the charge endpoint to return `500`. A regression in any one of them
  would be caught by all three tests at once and distinguished by none.
- **The most dangerous case reproduces a symptom, not the disease.** When
  `bookingClient.ConfirmBooking` errors *after* a successful charge, the
  customer's card was already captured, but the UI shows the exact same
  "please try again" banner as an ordinary decline — nothing distinguishes
  "safe to retry" from "retrying may double-charge you". The E2E test can
  (and does) reproduce that confusing UX. It cannot tell you whether a
  double charge actually happened. Only the Go test — or a real
  reconciliation check — can.

### 2.3 Contract cases can't reach the second service at all

`demo-story.md`'s 4 new Robot Framework cases prove `payment-service` and
`qoomlee-service` **agree with each other**, by calling both services' real
HTTP APIs directly and comparing the answers. A Playwright test has one
browser tab talking to whatever the mocked network layer hands back — there
is no second, independent connection to compare against. So §3's only move
is to mock both endpoints to agree with each other *by construction*, then
assert they agree. That
proves the mocks are internally consistent. It proves nothing about whether
the real services are — which is the entire point of a contract test.

Worse, once you're limited to what the frontend does with a response, three
of the four contract cases become **indistinguishable from each other, and
from two of the Go cases above**:

> `booking_expired` is the only 409 the frontend special-cases. "already
> CONFIRMED", "second charge on a SUCCEEDED payment", and "amount mismatch"
> all fall through to the same generic decline banner — so all three are
> the same assertion in this suite, just against different fixture bodies.
> A real amount-tampering attempt is, from the browser, visually identical
> to a card being declined for insufficient funds.

### 2.4 Duplicate coverage becomes the norm, not the exception

Add it up: `booking.Status == "EXPIRED"` is exercised once in §2 and once
again in §4a (same fetch, same assertion, same outcome). `booking.Status ==
"CONFIRMED"` on `Charge()` reuses the same stale-client trick as "already
CONFIRMED" in §3. Card-number validation is asserted in §2 *and* §4b,
because `demo-story.md` files that guard clause under two different test
suites from two different angles (a hook test, and a formatting-helper
test) — and at the browser layer, both angles produce the same click, the
same DOM, the same text. None of that is a mistake in how this suite was
written — it's what naturally happens once every case's only tool is
"load the page and see what happens." A pyramid doesn't just move cases to
cheaper layers; it removes this duplication by giving each layer a distinct
question only it can answer.

---

## 3. Totals

**36 cases → 1 file → 37 Playwright tests → 74 browser-page loads across two
projects (desktop + mobile), for coverage that:**

- drops several assertions entirely (nothing observable from a page to hang
  them on),
- can't tell 3–5 distinct backend/contract failure modes apart from each
  other,
- duplicates the same click-through 3–4 times under different case names,
- and needed two attempts at Playwright's clock API — the first one
  silently flaky — to pin down what a one-line pure function returns.

Compare to `demo-story.md`'s pyramid: the same 36 cases, run across four
layers, most of them not touching a browser or a running stack at all — and
every one of the specific things dropped or blurred above (gateway called
or not, exact row status, exact confirm args, real cross-service agreement,
one unambiguous digit-formatting assertion) is exactly what the layer
`demo-story.md` picks for that case *can* prove and this one can't.

**That gap — not "E2E is slow" as an abstract claim — is what the pyramid
buys you.** Refactoring `payment-traditional.spec.ts` back down to
`demo-story.md`'s shape — splitting it into files by layer as you go — is
the rest of this workshop.
