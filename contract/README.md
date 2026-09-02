# contract

Robot Framework cross-service contract tests — verifying qoomlee-service and
payment-service agree on shared state, not just that each API works in
isolation. This is the Contract tier of the workshop's Test Pyramid — see
`docs/stories/demo-story.md` §3.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Prerequisites

- Full stack running: `docker compose up --build` from the repo root
- `.env` has a **real** `OMISE_PUBLIC_KEY` / `OMISE_SECRET_KEY` pair (test keys
  from https://dashboard.omise.co) — the suite pulls a fresh single-use token
  per run via `make omise-token`
- Run from this directory, or `robot` will still find `make` via `${REPO_ROOT}`
  as long as the folder stays at the repo root

## Run

```bash
robot booking_payment_contract.robot
```

Or via the Makefile from the repo root:

```bash
make check-contract-robot
```

## What's here

| File | Covers |
|---|---|
| `booking_payment_contract.robot` | `POST /api/payments/charge` (payment-service) ⇄ qoomlee-service's booking state. Five cases: successful charge confirms the booking; an expired hold is refused (`409 booking_expired`); an already-confirmed booking is refused (`409 ALREADY_PAID`) even when reached via a path that never went through payment-service; a second charge on an already-paid booking is refused the same way; a charge with a mismatched amount is rejected (`400 AMOUNT_MISMATCH`) before the gateway is ever called. |

Everything but the "already confirmed" case asserts the effect from the
outside — it never calls qoomlee-service's internal status endpoint to
*simulate* a charge. The "already confirmed" case is the deliberate exception:
it uses that same internal endpoint (authenticated with the same
`X-Internal-Token` payment-service itself sends) to reach a state — CONFIRMED
with no payment row yet — that the public API alone can't produce.

The suite shells out to `make jwt-token`, `make internal-token`, and
`make omise-token` rather than duplicating RS256 signing / secret-reading /
Omise-vault logic here, so it always uses the same credentials as the rest of
the project's tooling.

Add more `*.robot` files here as you cover more cross-service behavior.
