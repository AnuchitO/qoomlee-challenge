*** Settings ***
Documentation     Cross-service contract test — qoomlee-service <-> payment-service.
...
...               Exercises the one integration point between the two services:
...               POST /api/payments/charge (payment-service) must, on a successful
...               Omise charge, call qoomlee-service's internal
...               PUT /api/bookings/:ref/status (authenticated by X-Internal-Token,
...               not JWT) — which flips the booking from PENDING to CONFIRMED.
...
...               This suite proves that contract from the outside: it never calls
...               the internal endpoint directly to *simulate* a charge, it only
...               asserts the *effect* is visible back on qoomlee-service after
...               payment-service acts. The one exception is the "already
...               confirmed" case below, which uses the internal endpoint
...               deliberately — to reach a state (CONFIRMED with no payment
...               row) that can't be produced through the public API alone.
...
...               Case list mirrors docs/stories/demo-story.md §3 (Contract) —
...               one existing happy-path case, four new ones proving the seams
...               where money and booking state must never disagree.
...
...               Requires the full stack running (`docker compose up --build`)
...               with a real OMISE_PUBLIC_KEY/OMISE_SECRET_KEY pair in `.env`
...               (Omise tokens are single-use, so a fresh one is fetched per run).
Library           RequestsLibrary
Library           Collections
Library           Process
Library           String
Suite Setup       Prepare Contract Test Session
Suite Teardown    Delete All Sessions

*** Variables ***
${QOOMLEE_BASE_URL}      http://localhost:9988
${PAYMENT_BASE_URL}      http://localhost:9984
${REPO_ROOT}             ${CURDIR}${/}..
${ORIGIN}                BKK
${DESTINATION}           SIN
${FLIGHT_DATE}           2026-06-15

*** Test Cases ***
Charging A Booking Confirms It Across Services
    [Documentation]    POST /api/payments/charge on payment-service must confirm
    ...                the booking on qoomlee-service via the internal status
    ...                endpoint — proving the two services agree on booking state.
    [Tags]    contract    cross-service

    # ── Arrange: find a flight, create a PENDING booking for it ───────────────
    ${booking_ref}    ${flight}=    Create Pending Booking
    ${amount_minor}=    Set Variable    ${flight}[basePriceMinor]
    ${currency}=        Set Variable    ${flight}[currency]

    # ── Act: charge it on payment-service ──────────────────────────────────────
    ${omise_token}=      Fetch Fresh Omise Token
    &{charge_body}=      Create Dictionary
    ...                  bookingRef=${booking_ref}
    ...                  omiseToken=${omise_token}
    ...                  amountMinor=${amount_minor}
    ...                  currency=${currency}
    ${charge}=            POST On Session    payment    /api/payments/charge
    ...                   json=${charge_body}    headers=${AUTH_HEADERS}    expected_status=201
    Should Be Equal As Strings    ${charge.json()}[status]    SUCCEEDED

    # ── Assert: qoomlee-service reflects the confirmation payment-service made ─
    ${confirmed}=    GET On Session    qoomlee    /api/bookings/${booking_ref}
    ...              headers=${AUTH_HEADERS}    expected_status=200
    Should Be Equal As Strings    ${confirmed.json()}[status]              CONFIRMED
    Should Be Equal As Strings    ${confirmed.json()}[paymentProvider]     OMISE
    Dictionary Should Contain Key    ${confirmed.json()}    providerChargeId

Charging An Expired Booking Returns 409 Booking Expired
    [Documentation]    payment-service must read qoomlee-service's EXPIRED
    ...                status and refuse the charge with 409 booking_expired —
    ...                money must never be captured for a seat hold that's
    ...                already been given back.
    [Tags]    contract    cross-service    expiry

    ${booking_ref}    ${flight}=    Create Pending Booking
    Backdate Booking Expiry    ${booking_ref}

    ${omise_token}=      Fetch Fresh Omise Token
    &{charge_body}=      Create Dictionary
    ...                  bookingRef=${booking_ref}    omiseToken=${omise_token}
    ...                  amountMinor=${flight}[basePriceMinor]    currency=${flight}[currency]
    ${charge}=           POST On Session    payment    /api/payments/charge
    ...                  json=${charge_body}    headers=${AUTH_HEADERS}    expected_status=409

    Should Be Equal As Strings    ${charge.json()}[error]    booking_expired
    ${still}=    GET On Session    qoomlee    /api/bookings/${booking_ref}
    ...          headers=${AUTH_HEADERS}    expected_status=200
    Should Be Equal As Strings    ${still.json()}[status]    EXPIRED

Charging An Already Confirmed Booking Returns 409 Already Paid
    [Documentation]    A booking can be CONFIRMED on qoomlee-service with no
    ...                payment row on payment-service yet (e.g. a retry that
    ...                landed after a prior attempt's confirm call already
    ...                went through). Reached here via the same internal
    ...                endpoint payment-service itself calls, authenticated
    ...                with the same X-Internal-Token — proving payment-service
    ...                checks the booking's live status, not just its own table.
    [Tags]    contract    cross-service

    ${booking_ref}    ${flight}=    Create Pending Booking
    Confirm Booking Internally    ${booking_ref}

    ${omise_token}=      Fetch Fresh Omise Token
    &{charge_body}=      Create Dictionary
    ...                  bookingRef=${booking_ref}    omiseToken=${omise_token}
    ...                  amountMinor=${flight}[basePriceMinor]    currency=${flight}[currency]
    ${charge}=            POST On Session    payment    /api/payments/charge
    ...                   json=${charge_body}    headers=${AUTH_HEADERS}    expected_status=409

    Should Be Equal As Strings    ${charge.json()}[error]    ALREADY_PAID

Charging A Booking Twice Returns 409 Already Paid
    [Documentation]    Guards QML-008 across the service boundary, not just
    ...                in-process: once payment-service itself has recorded a
    ...                SUCCEEDED payment for a booking, a second charge attempt
    ...                must be refused before it ever reaches the gateway.
    [Tags]    contract    cross-service

    ${booking_ref}    ${flight}=    Create Pending Booking
    ${amount_minor}=    Set Variable    ${flight}[basePriceMinor]
    ${currency}=        Set Variable    ${flight}[currency]

    ${first_token}=      Fetch Fresh Omise Token
    &{first_body}=       Create Dictionary
    ...                  bookingRef=${booking_ref}    omiseToken=${first_token}
    ...                  amountMinor=${amount_minor}    currency=${currency}
    POST On Session      payment    /api/payments/charge
    ...                  json=${first_body}    headers=${AUTH_HEADERS}    expected_status=201

    ${second_token}=     Fetch Fresh Omise Token
    &{second_body}=      Create Dictionary
    ...                  bookingRef=${booking_ref}    omiseToken=${second_token}
    ...                  amountMinor=${amount_minor}    currency=${currency}
    ${second}=           POST On Session    payment    /api/payments/charge
    ...                  json=${second_body}    headers=${AUTH_HEADERS}    expected_status=409

    Should Be Equal As Strings    ${second.json()}[error]    ALREADY_PAID

Charging With A Mismatched Amount Returns 400 Amount Mismatch
    [Documentation]    payment-service must re-derive the amount owed from
    ...                the booking it fetches, not trust whatever the client
    ...                sends — a caller (buggy or malicious) sending a lower
    ...                amountMinor than the booking's real total must be
    ...                rejected before the gateway is ever called.
    [Tags]    contract    cross-service

    ${booking_ref}    ${flight}=    Create Pending Booking

    ${omise_token}=      Fetch Fresh Omise Token
    &{charge_body}=      Create Dictionary
    ...                  bookingRef=${booking_ref}    omiseToken=${omise_token}
    ...                  amountMinor=1    currency=${flight}[currency]
    ${charge}=            POST On Session    payment    /api/payments/charge
    ...                   json=${charge_body}    headers=${AUTH_HEADERS}    expected_status=400

    Should Be Equal As Strings    ${charge.json()}[error]    AMOUNT_MISMATCH
    ${still}=    GET On Session    qoomlee    /api/bookings/${booking_ref}
    ...          headers=${AUTH_HEADERS}    expected_status=200
    Should Be Equal As Strings    ${still.json()}[status]    PENDING

*** Keywords ***
Prepare Contract Test Session
    Create Session    qoomlee    ${QOOMLEE_BASE_URL}
    Create Session    payment    ${PAYMENT_BASE_URL}
    ${token}=    Fetch JWT Token
    &{headers}=    Create Dictionary    Authorization=Bearer ${token}
    Set Suite Variable    ${AUTH_HEADERS}    ${headers}
    ${internal}=    Fetch Internal Token
    &{internal_headers}=    Create Dictionary    X-Internal-Token=${internal}
    Set Suite Variable    ${INTERNAL_HEADERS}    ${internal_headers}

Create Pending Booking
    [Documentation]    Finds a bookable flight and creates a fresh PENDING
    ...                booking for it. Returns the booking reference and the
    ...                flight dict (so callers can read basePriceMinor/currency
    ...                without a second search call).
    ${search}=          GET On Session    qoomlee    /api/flights/search
    ...                 params=origin=${ORIGIN}&destination=${DESTINATION}&date=${FLIGHT_DATE}&passengers=1
    ...                 expected_status=200
    ${flight}=          Set Variable    ${search.json()}[flights][0]
    ${suffix}=          Generate Random String    6    [LOWER][NUMBERS]
    &{passenger}=       Create Dictionary
    ...                 firstName=Contract    lastName=Test    email=contract.${suffix}@test.com
    &{booking_body}=    Create Dictionary
    ...                 flightId=${flight}[id]    passenger=${passenger}
    ...                 totalAmountMinor=${flight}[basePriceMinor]    currency=${flight}[currency]
    ${booking}=         POST On Session    qoomlee    /api/bookings
    ...                 json=${booking_body}    headers=${AUTH_HEADERS}    expected_status=201
    Should Be Equal As Strings    ${booking.json()}[status]    PENDING
    RETURN    ${booking.json()}[bookingRef]    ${flight}

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

Confirm Booking Internally
    [Documentation]    Calls the same internal endpoint payment-service itself
    ...                calls on a successful charge — used here to reach
    ...                CONFIRMED without going through payment-service at all,
    ...                so the "already confirmed" case doesn't depend on the
    ...                happy-path case having run first.
    [Arguments]    ${booking_ref}
    &{body}=    Create Dictionary    status=CONFIRMED
    PUT On Session    qoomlee    /api/bookings/${booking_ref}/status
    ...    json=${body}    headers=${INTERNAL_HEADERS}    expected_status=200

Fetch JWT Token
    [Documentation]    Shells out to `make jwt-token`, reusing the same RS256
    ...                signer the rest of the project's tooling uses instead
    ...                of duplicating JWT-signing logic here.
    ${result}=    Run Process    make    jwt-token    -s
    ...           cwd=${REPO_ROOT}    stdout=PIPE    stderr=PIPE
    Should Be Equal As Integers    ${result.rc}    0
    ...    msg=make jwt-token failed: ${result.stderr}
    RETURN    ${result.stdout.strip()}

Fetch Internal Token
    [Documentation]    Shells out to `make internal-token`, which just reads
    ...                INTERNAL_TOKEN out of .env — the same secret
    ...                payment-service sends on PUT /api/bookings/:ref/status.
    ${result}=    Run Process    make    internal-token    -s
    ...           cwd=${REPO_ROOT}    stdout=PIPE    stderr=PIPE
    Should Be Equal As Integers    ${result.rc}    0
    ...    msg=make internal-token failed: ${result.stderr}
    RETURN    ${result.stdout.strip()}

Fetch Fresh Omise Token
    [Documentation]    Omise tokens are single-use, so a new one is pulled from
    ...                `make omise-token` for every charge attempt.
    ${result}=    Run Process    make    omise-token
    ...           cwd=${REPO_ROOT}    stdout=PIPE    stderr=PIPE
    Should Be Equal As Integers    ${result.rc}    0
    ...    msg=make omise-token failed — set a real OMISE_PUBLIC_KEY in .env: ${result.stderr}
    ${parsed}=    Evaluate    json.loads('''${result.stdout}''')    json
    RETURN    ${parsed}[token]
