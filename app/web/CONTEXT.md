# Qoomlee Web Frontend

The Next.js frontend for the Qoomlee Airline booking platform.

## Language

**QA Quick-fill**:
A development-only UI panel that lets a tester fill the flight search form with a pre-defined search scenario in one click, then run the search normally. Built so its code is fully absent from production bundles (see ADR-0001).
_Avoid_: Dev tools, debug panel, test scenario picker

**Search scenario**:
A named, pre-filled `FlightSearchState` (origin, destination, dates, passengers, cabin, trip type) representing one test case for the flight search form, used by QA Quick-fill.
_Avoid_: Preset, fixture, test case
