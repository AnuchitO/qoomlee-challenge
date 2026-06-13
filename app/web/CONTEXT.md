# Qoomlee Web Frontend

The Next.js frontend for the Qoomlee Airline booking platform.

## Language

**QA Quick-fill**:
A development-only UI panel that lets a tester fill a page's form with a pre-defined scenario in one click, then proceed normally (e.g. run the search, continue to payment, submit the card form). Built so its code is fully absent from production bundles (see ADR-0001). Present on the flight search, booking, and payment pages, each with its own scenario list.
_Avoid_: Dev tools, debug panel, test scenario picker

**Scenario** (QA Quick-fill):
A named, pre-filled set of form values representing one test case for a page's form, used by QA Quick-fill. The shape is page-specific: a `FlightSearchState` (origin, destination, dates, passengers, cabin, trip type) for flight search, passenger details (name, email, phone) for booking, or card details (name, number, expiry, CVV, promo code) for payment.
_Avoid_: Preset, fixture, test case
