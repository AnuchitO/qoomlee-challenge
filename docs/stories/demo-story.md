# Demo story: Pay for a Booking — test pyramid workshop

> Anchors: `QML-028` (web, ✅ Done) and payment-service's `Service.Charge`
> (backend logic behind it, ✅ Done). Picked for the workshop because it's
> shipped, it's real money + seat-inventory risk, and it currently has **zero**
> tests at any layer (`services/payment/**/*_test.go` — none exist; nothing in
> `app/web/app/payment/` is covered either).

## Story

As a passenger, I want to pay for a pending booking so that my seat is
confirmed and I receive payment proof.

**Acceptance Criteria** (existing, from `QML-028`)

- **Given** I have a `PENDING` booking, **When** I open the payment page,
  **Then** the booking reference and total amount due are shown before I
  enter card details.
- **Given** I submit valid card details, **When** the charge succeeds,
  **Then** I see a success confirmation and the booking status updates to
  `CONFIRMED`.

## Test pyramid for this story

| Layer | What it proves | Count | Tool | Lives in |
|---|---|---|---|---|
| E2E | The real happy path (and its one true fork) work end-to-end, across the real backend | 2 | Playwright | `app/web/e2e/payment.spec.ts` |
| Component | Field validation + page-state rendering, in isolation | 12 | Vitest + Testing Library | `app/web/app/payment/*.test.ts(x)` |
| Contract | payment-service and qoomlee-service agree on booking state | 4 new (+1 existing) | Robot Framework | `contract/booking_payment_contract.robot` |
| Unit | Pure business logic, no I/O | 11 (Go) + 7 (TS) | Go `testing` / Vitest | `services/payment/payment/service_test.go`, `app/web/lib/payment/cardFormatting.test.ts` |

Bottom-heavy on purpose: cheap unit/component tests carry the guard-clause and
validation logic; E2E only proves the wiring holds together once.

**Naming convention:** every test name below is taken verbatim from its case
row in the table above it (markdown formatting stripped, wording untouched),
so the mapping from case → test → code needs no cross-referencing by number.

---

## 1. E2E — happy path only

**Pattern: Given / When / Then.** No per-field validation here — that's the
Component layer's job. One test proves the whole journey is wired correctly
against the real stack.

| # | Case |
|---|---|
| 1 | Given a searched flight and valid passenger details, When the passenger pays with a valid test card, Then they land on the confirmation page showing the same PNR the booking was created with |
| 2 | Given a booking that's already `CONFIRMED` (e.g. back-button after paying), When the payment page loads, Then it redirects straight to the confirmation page — no card form, no second charge |

### Example 1 — `app/web/e2e/payment.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("Given a searched flight and valid passenger details, When the passenger pays with a valid test card, Then they land on the confirmation page showing the same PNR the booking was created with", async ({
  page,
}) => {
  let bookingRef = "";

  await test.step("Given a passenger has searched and selected a flight", async () => {
    await page.goto(
      "/flights/search?origin=BKK&destination=HKT&date=2026-10-01&passengers=1",
    );
    await page.getByRole("button", { name: /select/i }).first().click();
  });

  await test.step("And filled in valid passenger details", async () => {
    // Selectors below are illustrative — match them to the real
    // /bookings/new form fields.
    await page.getByLabel("First name").fill("Jane");
    await page.getByLabel("Last name").fill("Doe");
    await page.getByLabel("Email").fill("jane.doe@test.com");
    await page.getByLabel("Phone").fill("0800000000");
    await page.getByRole("button", { name: /continue to payment/i }).click();

    await expect(page).toHaveURL(/\/payment\?/);
    bookingRef = new URL(page.url()).searchParams.get("ref") ?? "";
    expect(bookingRef).toMatch(/^[A-Z0-9]{6}$/);
  });

  await test.step("When they pay with a valid test card", async () => {
    await page.getByPlaceholder("e.g. Johnathan Doe").fill("Jane Doe");
    await page
      .getByPlaceholder("0000 0000 0000 0000")
      .fill("4242 4242 4242 4242");
    await page.getByPlaceholder("MM/YY").fill("12/29");
    await page.getByPlaceholder("•••").fill("123");
    await page.getByLabel(/agree to the terms/i).check();
    await page.getByRole("button", { name: /pay .* securely/i }).click();
  });

  await test.step("Then they land on the confirmation page showing the same PNR", async () => {
    await expect(page).toHaveURL(/\/bookings\/confirmation/);
    await expect(page.getByText(bookingRef)).toBeVisible();
  });
});
```

### Example 2 — already-confirmed booking, `app/web/e2e/payment.spec.ts`

`SEED01` is a seeded booking that's already `CONFIRMED`, so this case doesn't
need to run the whole create-and-pay flow first — it goes straight at
`/payment` with that ref.

```ts
test("Given a booking that's already CONFIRMED (e.g. back-button after paying), When the payment page loads, Then it redirects straight to the confirmation page — no card form, no second charge", async ({
  page,
}) => {
  await test.step("Given a CONFIRMED booking (SEED01)", async () => {
    // seeded by infra/db/qoomlee/02_seed.sql — status CONFIRMED
  });

  await test.step("When the payment page loads for it", async () => {
    await page.goto("/payment?ref=SEED01");
  });

  await test.step("Then it redirects to confirmation, skipping the form", async () => {
    await expect(page).toHaveURL(/\/bookings\/confirmation\?ref=SEED01/);
    await expect(
      page.getByPlaceholder("0000 0000 0000 0000"),
    ).not.toBeVisible();
  });
});
```

---

## 2. Component — validation & page state

Two seams, two ways of rendering:

- **Field validation** lives inside the `usePaymentClient` hook — test it with
  `renderHook`, mocking `getJson`/`postJson` from `lib/api/httpClient`.
- **Page state** (`loading` / `ready` / `expired`) is a pure prop on
  `PaymentClientView` — test it by rendering the view directly with a fixed
  `bookingState`, no hook or network involved.

| # | Type | Case |
|---|---|---|
| 1 | Field validation | Empty card name → `errors.cardName === "Required"`, submit blocked |
| 2 | Field validation | Card number ≠16 digits → error shown, blocked |
| 3 | Field validation | Expiry not `MM/YY` → error shown, blocked |
| 4 | Field validation | CVV not 3–4 digits → error shown, blocked |
| 5 | Field validation | Terms checkbox unchecked → `"You must agree to the terms..."`, blocked |
| 6 | Field validation | All fields valid → no errors, `postJson` is called |
| 7 | Page state | Booking fetch returns `EXPIRED` → expired panel rendered, card form hidden |
| 8 | Page state | Booking fetch returns `CONFIRMED` → `router.replace` to confirmation, no form render |
| 9 | Page state | Booking fetch 404s → `router.replace('/bookings/new')` |
| 10 | Page state | Charge response `409 booking_expired` → switches to the expired panel, not a generic error |
| 11 | Page state | Charge response, other failure → "We couldn't process your payment" shown, `submitting` resets, form stays usable |
| 12 | Page state | Promo code: valid → discount reflected in total; invalid → "Invalid promo code" shown, total unchanged |

### Example A — field validation, `app/web/app/payment/usePaymentClient.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePaymentClient } from "./usePaymentClient";
import { getJson, postJson } from "@/lib/api/httpClient";
import { ok } from "@/lib/result/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));
vi.mock("@/lib/api/httpClient");

const bookingProps = {
  bookingRef: "ABC123",
  flightNumber: "QL204",
  origin: "BKK",
  destination: "HKT",
  departureTime: "2026-09-10T08:00:00Z",
  basePriceMinor: 150000,
  currency: "THB",
  passengers: 1,
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@test.com",
  phone: "0800000000",
};

describe("usePaymentClient — card validation", () => {
  beforeEach(() => {
    vi.mocked(getJson).mockResolvedValue(
      ok({
        status: "PENDING",
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        totalAmountMinor: 150000,
      }),
    );
  });

  it('case 1: empty card name → errors.cardName === "Required", submit blocked', async () => {
    const { result } = renderHook(() => usePaymentClient(bookingProps));
    await waitFor(() => expect(result.current.bookingState).toBe("ready"));

    // fill every field except cardName
    act(() => {
      result.current.handleCardNumberChange({
        target: { value: "4242424242424242" },
      } as any);
      result.current.handleExpiryChange({ target: { value: "1229" } } as any);
      result.current.handleCvvChange({ target: { value: "123" } } as any);
      result.current.handleAgreedChange({
        target: { checked: true },
      } as any);
    });

    await act(async () => {
      await result.current.handlePay();
    });

    expect(result.current.errors.cardName).toBe("Required");
    expect(postJson).not.toHaveBeenCalled();
  });
});
```

The other four field-validation cases (#2–5) follow the identical shape:
fill every field validly *except* the one under test, call `handlePay`,
assert the matching `errors.<field>` and that `postJson` was never called.
Case #6 is the mirror image — fill every field validly, call `handlePay`,
assert `errors` is `{}` and `postJson` *was* called with the right body.

### Example B — page-state rendering (case 7), `app/web/app/payment/PaymentClientView.test.tsx`

`PaymentClientView` is a pure presentational component — `bookingState` is
just a prop. That makes the cheapest way to test "does the UI show the right
thing for this state" a direct render, no hook, no network, no router mock.

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentClientView } from "./PaymentClientView";

const baseProps = {
  bookingState: "ready" as const,
  flightNumber: "QL204",
  origin: "BKK",
  destination: "HKT",
  departureTime: "2026-09-10T08:00:00Z",
  passengers: 1,
  secondsLeft: 900,
  promoInput: "",
  promoApplied: false,
  promoError: "",
  handlePromoInputChange: vi.fn(),
  handleApplyPromo: vi.fn(),
  activeMethod: "card" as const,
  setActiveMethod: vi.fn(),
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  saveCard: true,
  sameAddress: true,
  agreed: false,
  errors: {},
  handleCardNameChange: vi.fn(),
  handleCardNumberChange: vi.fn(),
  handleExpiryChange: vi.fn(),
  handleCvvChange: vi.fn(),
  handleSaveCardChange: vi.fn(),
  handleSameAddressToggle: vi.fn(),
  handleAgreedChange: vi.fn(),
  baseFareMinor: 150000,
  taxMinor: 22500,
  discountMinor: 0,
  totalMinor: 231500,
  submitError: "",
  submitting: false,
  handlePay: vi.fn(),
  goBack: vi.fn(),
};

describe("PaymentClientView — page states", () => {
  it("case 7: booking fetch returns EXPIRED → expired panel rendered, card form hidden", () => {
    render(<PaymentClientView {...baseProps} bookingState="expired" />);

    expect(
      screen.getByText("Your booking hold has expired"),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("0000 0000 0000 0000"),
    ).not.toBeInTheDocument();
  });

  it("sanity baseline (not case-counted): renders the card form when bookingState is \"ready\"", () => {
    render(<PaymentClientView {...baseProps} bookingState="ready" />);

    expect(
      screen.getByPlaceholderText("0000 0000 0000 0000"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Your booking hold has expired"),
    ).not.toBeInTheDocument();
  });
});
```

The second `it` above (`bookingState="ready"`) isn't one of the 12 counted
cases — it's the sanity baseline the other view assertions lean on, cheap
enough to include for free.

### Example C — fetch/redirect branches (cases 8–12), `app/web/app/payment/usePaymentClient.test.ts`

Cases 8–11 are branches inside the same `useEffect`/`handlePay` logic
Example A already exercises — same `renderHook` harness, different mocked
response per case. Case 12 (promo) is a pure state transition inside the
hook, no network involved.

```ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePaymentClient } from "./usePaymentClient";
import { getJson, postJson } from "@/lib/api/httpClient";
import { ok, err } from "@/lib/result/types";
import { HttpError } from "@/lib/api/errors";

vi.mock("next/navigation", () => {
  const replace = vi.fn();
  return { useRouter: () => ({ replace, push: vi.fn(), back: vi.fn() }) };
});
vi.mock("@/lib/api/httpClient");

const bookingProps = {
  bookingRef: "ABC123",
  flightNumber: "QL204",
  origin: "BKK",
  destination: "HKT",
  departureTime: "2026-09-10T08:00:00Z",
  basePriceMinor: 150000,
  currency: "THB",
  passengers: 1,
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@test.com",
  phone: "0800000000",
};

describe("usePaymentClient — fetch and redirect branches", () => {
  it("case 8: booking fetch returns CONFIRMED → router.replace to confirmation, no form render", async () => {
    const { useRouter } = await import("next/navigation");
    const router = useRouter();
    vi.mocked(getJson).mockResolvedValue(ok({ status: "CONFIRMED" }));

    renderHook(() => usePaymentClient(bookingProps));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith(
        "/bookings/confirmation?ref=ABC123",
      ),
    );
  });

  it("case 9: booking fetch 404s → router.replace('/bookings/new')", async () => {
    const { useRouter } = await import("next/navigation");
    const router = useRouter();
    vi.mocked(getJson).mockResolvedValue(
      err(HttpError.badStatus(404, "not found")),
    );

    renderHook(() => usePaymentClient(bookingProps));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/bookings/new"),
    );
  });

  it("case 10: charge response 409 booking_expired → switches to the expired panel, not a generic error", async () => {
    vi.mocked(getJson).mockResolvedValue(
      ok({
        status: "PENDING",
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        totalAmountMinor: 150000,
      }),
    );
    vi.mocked(postJson).mockResolvedValue(
      err(HttpError.badStatus(409, "expired", { error: "booking_expired" })),
    );

    const { result } = renderHook(() => usePaymentClient(bookingProps));
    await waitFor(() => expect(result.current.bookingState).toBe("ready"));

    act(() => {
      result.current.handleCardNameChange({ target: { value: "Jane Doe" } } as any);
      result.current.handleCardNumberChange({ target: { value: "4242424242424242" } } as any);
      result.current.handleExpiryChange({ target: { value: "1229" } } as any);
      result.current.handleCvvChange({ target: { value: "123" } } as any);
      result.current.handleAgreedChange({ target: { checked: true } } as any);
    });

    await act(async () => {
      await result.current.handlePay();
    });

    expect(result.current.bookingState).toBe("expired");
    expect(result.current.submitError).toBe("");
  });

  it('case 11: charge response, other failure → "We couldn\'t process your payment" shown, submitting resets, form stays usable', async () => {
    vi.mocked(getJson).mockResolvedValue(
      ok({
        status: "PENDING",
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        totalAmountMinor: 150000,
      }),
    );
    vi.mocked(postJson).mockResolvedValue(
      err(HttpError.badStatus(402, "card declined")),
    );

    const { result } = renderHook(() => usePaymentClient(bookingProps));
    await waitFor(() => expect(result.current.bookingState).toBe("ready"));

    act(() => {
      result.current.handleCardNameChange({ target: { value: "Jane Doe" } } as any);
      result.current.handleCardNumberChange({ target: { value: "4242424242424242" } } as any);
      result.current.handleExpiryChange({ target: { value: "1229" } } as any);
      result.current.handleCvvChange({ target: { value: "123" } } as any);
      result.current.handleAgreedChange({ target: { checked: true } } as any);
    });

    await act(async () => {
      await result.current.handlePay();
    });

    expect(result.current.bookingState).toBe("ready");
    expect(result.current.submitError).toBe(
      "We couldn't process your payment. Please try again.",
    );
    expect(result.current.submitting).toBe(false);
  });

  it('case 12: promo code: valid → discount reflected in total; invalid → "Invalid promo code" shown, total unchanged', async () => {
    vi.mocked(getJson).mockResolvedValue(
      ok({
        status: "PENDING",
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        totalAmountMinor: 150000,
      }),
    );

    const { result } = renderHook(() => usePaymentClient(bookingProps));
    await waitFor(() => expect(result.current.bookingState).toBe("ready"));
    const totalBefore = result.current.totalMinor;

    act(() => {
      result.current.handlePromoInputChange({
        target: { value: "nope" },
      } as any);
    });
    act(() => result.current.handleApplyPromo());
    expect(result.current.promoError).toBe("Invalid promo code");
    expect(result.current.totalMinor).toBe(totalBefore);

    act(() => {
      result.current.handlePromoInputChange({
        target: { value: "QOOMFIRST" },
      } as any);
    });
    act(() => result.current.handleApplyPromo());
    expect(result.current.promoApplied).toBe(true);
    expect(result.current.totalMinor).toBe(totalBefore - 50000);
  });
});
```

---

## 3. Contract — payment-service ⇄ qoomlee-service

`contract/booking_payment_contract.robot` already has one happy-path case
(`Charging A Booking Confirms It Across Services`). Add:

| # | Case |
|---|---|
| 2 | Charge on a booking qoomlee-service reports `EXPIRED` → payment-service returns `409 booking_expired`, and qoomlee-service still shows `EXPIRED` afterwards |
| 3 | Charge on a booking already `CONFIRMED` → `409 already_paid` |
| 4 | Second charge on a booking with an existing `SUCCEEDED` payment → `409 already_paid` (guards `QML-008` across the service boundary, not just in-process) |
| 5 | Charge with `amountMinor`/`currency` not matching the booking's real total on qoomlee-service → rejected |

### Example — new case + supporting keyword

```robot
*** Test Cases ***
Charge on a booking qoomlee-service reports EXPIRED → payment-service returns 409 booking_expired, and qoomlee-service still shows EXPIRED afterwards
    [Documentation]    payment-service must read qoomlee-service's EXPIRED
    ...                status and refuse the charge with 409 booking_expired —
    ...                money must never be captured for a seat hold that's
    ...                already been given back.
    [Tags]    contract    cross-service    expiry

    # ── Arrange: create a booking, then force its hold into the past ──────────
    ${search}=          GET On Session    qoomlee    /api/flights/search
    ...                 params=origin=${ORIGIN}&destination=${DESTINATION}&date=${FLIGHT_DATE}&passengers=1
    ...                 expected_status=200
    ${flight}=          Set Variable    ${search.json()}[flights][0]
    ${suffix}=          Generate Random String    6    [LOWER][NUMBERS]
    &{passenger}=       Create Dictionary
    ...                 firstName=Contract    lastName=Expired    email=expired.${suffix}@test.com
    &{booking_body}=    Create Dictionary
    ...                 flightId=${flight}[id]    passenger=${passenger}
    ...                 totalAmountMinor=${flight}[basePriceMinor]    currency=${flight}[currency]
    ${booking}=         POST On Session    qoomlee    /api/bookings
    ...                 json=${booking_body}    headers=${AUTH_HEADERS}    expected_status=201
    ${booking_ref}=     Set Variable    ${booking.json()}[bookingRef]
    Backdate Booking Expiry    ${booking_ref}

    # ── Act: attempt to charge it ───────────────────────────────────────────
    ${omise_token}=      Fetch Fresh Omise Token
    &{charge_body}=      Create Dictionary
    ...                  bookingRef=${booking_ref}    omiseToken=${omise_token}
    ...                  amountMinor=${flight}[basePriceMinor]    currency=${flight}[currency]
    ${charge}=            POST On Session    payment    /api/payments/charge
    ...                   json=${charge_body}    headers=${AUTH_HEADERS}    expected_status=409

    # ── Assert: refused, and qoomlee-service's own view agrees ────────────────
    Should Be Equal As Strings    ${charge.json()}[error]    booking_expired
    ${confirmed}=    GET On Session    qoomlee    /api/bookings/${booking_ref}
    ...              headers=${AUTH_HEADERS}    expected_status=200
    Should Be Equal As Strings    ${confirmed.json()}[status]    EXPIRED

*** Keywords ***
Backdate Booking Expiry
    [Documentation]    Forces a booking's hold into the past so the next read
    ...                lazily expires it — the only way to reach EXPIRED in a
    ...                black-box contract test without waiting out the real
    ...                15-minute hold.
    [Arguments]    ${booking_ref}
    ${result}=    Run Process
    ...    docker    compose    exec    -T    postgres-qoomlee
    ...    psql    -U    qoomlee    -d    qoomlee
    ...    -c    UPDATE bookings SET expires_at = NOW() - INTERVAL '1 minute' WHERE booking_ref = '${booking_ref}';
    ...    cwd=${REPO_ROOT}    stdout=PIPE    stderr=PIPE
    Should Be Equal As Integers    ${result.rc}    0
    ...    msg=failed to backdate booking ${booking_ref}: ${result.stderr}
```

Cases #3 and #4 can reuse the seeded `SEED01` (already `CONFIRMED`) instead of
creating a fresh booking. Case #5 reuses the happy-path booking-creation block
but sends `amountMinor=1` (or any value that doesn't match `basePriceMinor`)
in the charge body.

---

## 4. Unit — pure logic, no I/O

**Pattern: Arrange / Act / Assert**, one block per case, so each row below
translates ~1:1 into a `t.Run` / `it`.

### 4a. Go — `services/payment/payment/service_test.go`

| # | Case |
|---|---|
| 1 | Existing `SUCCEEDED` payment for the booking → `ErrAlreadyPaid`, gateway never called |
| 2 | `repo.GetByBookingRef` returns a non-`ErrNotFound` error → propagated, gateway never called |
| 3 | `bookingClient.GetBooking` errors → propagated |
| 4 | `booking.Status == "EXPIRED"` → `ErrBookingExpired`, gateway never called |
| 5 | `booking.Status == "CONFIRMED"` → `ErrAlreadyPaid`, gateway never called |
| 6 | `req.AmountMinor`/`Currency` mismatch vs. the booking's real total → `ErrAmountMismatch`, gateway never called |
| 7 | `omise.CreateCharge` errors → propagated, nothing inserted |
| 8 | Gateway declines (`status: "failed"`) → row inserted as `FAILED` with the failure code/message, returns `*FailedError`, `ConfirmBooking` **not** called |
| 9 | Gateway succeeds → row inserted `SUCCEEDED` with `PaidAt` set, `ConfirmBooking` called with the inserted `PaymentID`/provider/chargeID |
| 10 | `repo.Insert` errors on the success path → propagated |
| 11 | `bookingClient.ConfirmBooking` errors *after* a successful charge → propagated, and flagged — money was already captured with no compensation path |

```go
// Arrange / Act / Assert pattern throughout — each Charge() branch gets its
// own case below, following the guard-clause order in service.go.
package payment

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// --- test doubles ------------------------------------------------------

type stubBookingClient struct {
	booking       *BookingDetail
	getErr        error
	confirmErr    error
	confirmCalled bool
	confirmReq    ConfirmRequest
}

func (s *stubBookingClient) GetBooking(ctx context.Context, ref string) (*BookingDetail, error) {
	return s.booking, s.getErr
}

func (s *stubBookingClient) ConfirmBooking(ctx context.Context, ref string, req ConfirmRequest) error {
	s.confirmCalled = true
	s.confirmReq = req
	return s.confirmErr
}

type stubOmiser struct {
	result *ChargeResult
	err    error
	called bool
}

func (s *stubOmiser) CreateCharge(ctx context.Context, req ChargeRequest) (*ChargeResult, error) {
	s.called = true
	return s.result, s.err
}

type stubRepository struct {
	existing     *Payment
	getErr       error
	insertErr    error
	inserted     *Payment
	insertCalled bool
}

func (s *stubRepository) GetByBookingRef(ctx context.Context, ref string) (*Payment, error) {
	return s.existing, s.getErr
}

func (s *stubRepository) Insert(ctx context.Context, p *Payment) (*Payment, error) {
	s.insertCalled = true
	if s.insertErr != nil {
		return nil, s.insertErr
	}
	p.ID = 99
	s.inserted = p
	return p, nil
}

// --- cases ---------------------------------------------------------------

func TestServiceCharge(t *testing.T) {
	t.Run("case 1: existing SUCCEEDED payment for the booking → ErrAlreadyPaid, gateway never called", func(t *testing.T) {
		// Arrange
		repo := &stubRepository{existing: &Payment{BookingRef: "ABC123", Status: statusSucceeded}}
		booking := &stubBookingClient{}
		omise := &stubOmiser{}
		svc := NewService(booking, omise, repo)
		req := ChargeRequest{BookingRef: "ABC123", AmountMinor: 150000, Currency: "THB"}

		// Act
		payment, err := svc.Charge(context.Background(), req)

		// Assert
		require.ErrorIs(t, err, ErrAlreadyPaid)
		assert.Nil(t, payment)
		assert.False(t, omise.called, "must not call the gateway once a payment already succeeded")
	})

	t.Run(`case 4: booking.Status == "EXPIRED" → ErrBookingExpired, gateway never called`, func(t *testing.T) {
		// Arrange
		repo := &stubRepository{getErr: ErrNotFound}
		booking := &stubBookingClient{booking: &BookingDetail{
			BookingRef: "ABC123", Status: "EXPIRED", TotalAmountMinor: 150000, Currency: "THB",
		}}
		omise := &stubOmiser{}
		svc := NewService(booking, omise, repo)
		req := ChargeRequest{BookingRef: "ABC123", AmountMinor: 150000, Currency: "THB"}

		// Act
		payment, err := svc.Charge(context.Background(), req)

		// Assert
		require.ErrorIs(t, err, ErrBookingExpired)
		assert.Nil(t, payment)
		assert.False(t, omise.called)
	})

	t.Run("case 6: AmountMinor/Currency mismatch vs. the booking's real total → ErrAmountMismatch, gateway never called", func(t *testing.T) {
		// Arrange
		repo := &stubRepository{getErr: ErrNotFound}
		booking := &stubBookingClient{booking: &BookingDetail{
			BookingRef: "ABC123", Status: "PENDING", TotalAmountMinor: 150000, Currency: "THB",
		}}
		omise := &stubOmiser{}
		svc := NewService(booking, omise, repo)
		req := ChargeRequest{BookingRef: "ABC123", AmountMinor: 99900, Currency: "THB"} // client sent the wrong amount

		// Act
		payment, err := svc.Charge(context.Background(), req)

		// Assert
		require.ErrorIs(t, err, ErrAmountMismatch)
		assert.Nil(t, payment)
		assert.False(t, omise.called)
	})

	t.Run(`case 8: gateway declines (status: "failed") → row inserted as FAILED, returns *FailedError, ConfirmBooking not called`, func(t *testing.T) {
		// Arrange
		repo := &stubRepository{getErr: ErrNotFound}
		booking := &stubBookingClient{booking: &BookingDetail{
			BookingID: 1, BookingRef: "ABC123", Status: "PENDING", TotalAmountMinor: 150000, Currency: "THB",
		}}
		omise := &stubOmiser{result: &ChargeResult{
			Status: "failed", FailureCode: "insufficient_fund", FailureMessage: "The card has insufficient funds.",
		}}
		svc := NewService(booking, omise, repo)
		req := ChargeRequest{BookingRef: "ABC123", AmountMinor: 150000, Currency: "THB"}

		// Act
		payment, err := svc.Charge(context.Background(), req)

		// Assert
		var failedErr *FailedError
		require.ErrorAs(t, err, &failedErr)
		assert.Equal(t, "insufficient_fund", failedErr.FailureCode)
		assert.Nil(t, payment)
		require.True(t, repo.insertCalled, "the FAILED attempt must still be recorded")
		assert.Equal(t, "FAILED", repo.inserted.Status)
		assert.False(t, booking.confirmCalled, "a failed charge must never confirm the booking")
	})

	t.Run("case 9: gateway succeeds → row inserted SUCCEEDED with PaidAt set, ConfirmBooking called with the inserted PaymentID/provider/chargeID", func(t *testing.T) {
		// Arrange
		repo := &stubRepository{getErr: ErrNotFound}
		booking := &stubBookingClient{booking: &BookingDetail{
			BookingID: 1, BookingRef: "ABC123", Status: "PENDING", TotalAmountMinor: 150000, Currency: "THB",
		}}
		omise := &stubOmiser{result: &ChargeResult{ProviderChargeID: "chrg_test_1", Status: "successful"}}
		svc := NewService(booking, omise, repo)
		req := ChargeRequest{BookingRef: "ABC123", AmountMinor: 150000, Currency: "THB"}

		// Act
		payment, err := svc.Charge(context.Background(), req)

		// Assert
		require.NoError(t, err)
		require.NotNil(t, payment)
		assert.Equal(t, "SUCCEEDED", payment.Status)
		assert.False(t, payment.PaidAt.IsZero())
		require.True(t, booking.confirmCalled, "a successful charge must confirm the booking")
		assert.Equal(t, payment.ID, booking.confirmReq.PaymentID)
		assert.Equal(t, "chrg_test_1", booking.confirmReq.ProviderChargeID)
	})

	t.Run("case 11: bookingClient.ConfirmBooking errors after a successful charge → propagated, and flagged — money was already captured with no compensation path", func(t *testing.T) {
		// Arrange
		repo := &stubRepository{getErr: ErrNotFound}
		booking := &stubBookingClient{
			booking: &BookingDetail{
				BookingID: 1, BookingRef: "ABC123", Status: "PENDING", TotalAmountMinor: 150000, Currency: "THB",
			},
			confirmErr: errors.New("qoomlee-service unreachable"),
		}
		omise := &stubOmiser{result: &ChargeResult{ProviderChargeID: "chrg_test_1", Status: "successful"}}
		svc := NewService(booking, omise, repo)
		req := ChargeRequest{BookingRef: "ABC123", AmountMinor: 150000, Currency: "THB"}

		// Act
		payment, err := svc.Charge(context.Background(), req)

		// Assert
		require.Error(t, err)
		assert.Nil(t, payment)
		assert.True(t, repo.insertCalled, "money was already captured by the gateway — the payment row must still exist")
		// ⚠ known gap, not asserted away: there is no reconciliation path back
		// to the booking here. Worth its own ticket (a reconciliation sweep,
		// or re-checking booking status before treating this as a hard error).
	})
}
```

Cases 2, 3, 5, 7, and 10 are one-line variations on the same shape — swap
which stub returns an error (`repo.getErr`, `booking.getErr`, a status other
than `EXPIRED`/`CONFIRMED`, `omise.err`, `repo.insertErr`) and assert it comes
back out of `Charge()` unchanged, with the gateway/insert untouched where the
guard clause should short-circuit before reaching them.

### 4b. Frontend pure functions — `app/web/app/payment/usePaymentClient.test.ts` / `app/web/lib/payment/cardFormatting.test.ts`

| # | Case |
|---|---|
| 1 | `formatCountdown(65)` → `"01:05"` (zero-padded minutes and seconds) |
| 2 | `formatDeparture` renders the correct weekday/day/month across a UTC midnight boundary |
| 3 | `formatCardNumber` strips non-digits, groups by 4, truncates at 16 |
| 4 | `formatExpiry` turns raw digits into `MM/YY`, truncates at 4 digits |
| 5 | `formatCvv` strips non-digits, truncates at 4 |
| 6 | `validateCardFields` flags a card number that isn't exactly 16 digits, and returns `{}` when every field is valid |
| 7 | Pricing (`baseFareMinor`/`taxMinor`/`totalMinor`) — **deferred**, see note below |

```ts
// app/web/app/payment/usePaymentClient.test.ts
import { describe, it, expect } from "vitest";
import { formatCountdown, formatDeparture } from "./usePaymentClient";

describe("formatCountdown", () => {
  it('case 1: formatCountdown(65) → "01:05" (zero-padded minutes and seconds)', () => {
    // Arrange
    const secondsLeft = 65;

    // Act
    const result = formatCountdown(secondsLeft);

    // Assert
    expect(result).toBe("01:05");
  });
});

describe("formatDeparture", () => {
  it("case 2: formatDeparture renders the correct weekday/day/month across a UTC midnight boundary", () => {
    // Arrange — 2026-01-01T00:30:00Z: local midnight-adjacent time in
    // most western timezones would roll back to 2025-12-31 if this
    // accidentally used local time instead of UTC.
    const iso = "2026-01-01T00:30:00Z";

    // Act
    const result = formatDeparture(iso);

    // Assert
    expect(result).toBe("Thu 1 Jan");
  });
});
```

```ts
// app/web/lib/payment/cardFormatting.test.ts (formatting helpers)
import { describe, it, expect } from "vitest";
import { formatCardNumber, formatExpiry, formatCvv } from "./cardFormatting";

describe("formatCardNumber", () => {
  it("case 3: formatCardNumber strips non-digits, groups by 4, truncates at 16", () => {
    // Arrange
    const raw = "4242-4242 4242424299999";

    // Act
    const result = formatCardNumber(raw);

    // Assert
    expect(result).toBe("4242 4242 4242 4299");
  });
});

describe("formatExpiry", () => {
  it("case 4: formatExpiry turns raw digits into MM/YY, truncates at 4 digits", () => {
    // Arrange
    const raw = "122999";

    // Act
    const result = formatExpiry(raw);

    // Assert
    expect(result).toBe("12/29");
  });
});

describe("formatCvv", () => {
  it("case 5: formatCvv strips non-digits, truncates at 4", () => {
    // Arrange
    const raw = "1a2b3c4d5";

    // Act
    const result = formatCvv(raw);

    // Assert
    expect(result).toBe("1234");
  });
});
```

```ts
// app/web/lib/payment/cardFormatting.test.ts
import { describe, it, expect } from "vitest";
import { validateCardFields } from "./cardFormatting";

describe("validateCardFields", () => {
  it("case 6: validateCardFields flags a card number that isn't exactly 16 digits", () => {
    // Arrange
    const fields = {
      cardName: "Jane Doe",
      cardNumber: "4242 4242",
      expiry: "12/29",
      cvv: "123",
    };

    // Act
    const errors = validateCardFields(fields);

    // Assert
    expect(errors.cardNumber).toBe("Enter a valid 16-digit card number");
  });

  it("case 6: validateCardFields returns {} when every field is valid", () => {
    // Arrange
    const fields = {
      cardName: "Jane Doe",
      cardNumber: "4242424242424242",
      expiry: "12/29",
      cvv: "123",
    };

    // Act
    const errors = validateCardFields(fields);

    // Assert
    expect(errors).toEqual({});
  });
});
```

> **Case 7, deferred:** pricing (`baseFareMinor` / `taxMinor` / `totalMinor`)
> currently lives inline inside `usePaymentClient`, not as an exported pure
> function — so it isn't unit-testable today without going through
> `renderHook` (which is what Example C's case 12 already does incidentally,
> via `totalMinor` before/after applying a promo). Worth extracting into a
> small `computeTotal({ basePriceMinor, passengers, promoApplied })` function
> purely to make it directly unit-testable — a real rounding case (odd cents
> on `taxMinor`'s 15% calculation) belongs here once that exists, not folded
> into a Component test as a workaround.

---

## Totals

**2 E2E · 12 component · 4 new contract (+1 existing) · 18 unit (11 Go + 7 TS,
1 of which — pricing — is written up but deferred pending the `computeTotal`
extraction) = 36 new cases.** Counting the contract suite's one pre-existing
happy-path case, the finished suite holds 37.

Do unit + component first — no running stack required, and they cover every
guard clause and validation rule. Add contract next (needs
`docker compose up`), E2E last (needs the full stack + a real Omise sandbox
token).
