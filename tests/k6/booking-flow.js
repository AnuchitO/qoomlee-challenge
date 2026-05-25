/**
 * k6 load test — Booking Creation
 * Tests: 50 virtual users over 30 seconds
 * Thresholds: p95 < 1000ms, error rate < 1%
 *
 * Run: k6 run scripts/performance/booking-flow.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  vus: 50,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.01"],
    errors: ["rate<0.01"],
  },
};

const FLIGHTS_URL  = __ENV.FLIGHT_SERVICE_URL  || "http://localhost:8081";
const BOOKINGS_URL = __ENV.BOOKING_SERVICE_URL || "http://localhost:8082";

const HEADERS = { "Content-Type": "application/json" };

function randomEmail() {
  return `loadtest-${Date.now()}-${Math.random().toString(36).slice(2)}@k6.test`;
}

function randomPassport() {
  return "LT" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function setup() {
  // Fetch a valid flight ID to use throughout the test
  const res = http.get(
    `${FLIGHTS_URL}/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15`
  );
  const body = JSON.parse(res.body);
  if (!body.flights || body.flights.length === 0) {
    throw new Error("No flights available — ensure seed data is loaded");
  }
  return { flightId: body.flights[0].id };
}

export default function (data) {
  const { flightId } = data;

  // Step 1: Create booking
  const bookingPayload = JSON.stringify({
    flightId,
    passenger: {
      firstName: "Load",
      lastName: "Tester",
      email: randomEmail(),
      passportNumber: randomPassport(),
    },
    totalAmount: 3500.0,
    currency: "THB",
  });

  const bookingRes = http.post(`${BOOKINGS_URL}/api/bookings`, bookingPayload, {
    headers: HEADERS,
  });

  const bookingOk = check(bookingRes, {
    "booking status 201": (r) => r.status === 201,
    "booking has PNR": (r) => {
      try {
        return JSON.parse(r.body).bookingRef?.length === 6;
      } catch {
        return false;
      }
    },
    "booking time < 1000ms": (r) => r.timings.duration < 1000,
  });

  errorRate.add(!bookingOk);
  sleep(0.5);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.["p(95)"] ?? 0;
  const errRate = data.metrics.http_req_failed?.values?.rate ?? 0;
  const totalReqs = data.metrics.http_reqs?.values?.count ?? 0;

  const pass = p95 < 1000 && errRate < 0.01;

  return {
    stdout: `
Booking Creation Load Test Results
────────────────────────────────────
  Bookings created: ${totalReqs}
  p50 latency:      ${(data.metrics.http_req_duration?.values?.["p(50)"] ?? 0).toFixed(0)}ms
  p95 latency:      ${p95.toFixed(0)}ms  ${p95 < 1000 ? "✓" : "✗ (threshold: <1000ms)"}
  Error rate:       ${(errRate * 100).toFixed(2)}%  ${errRate < 0.01 ? "✓" : "✗ (threshold: <1%)"}

  Result: ${pass ? "✓ PASS" : "✗ FAIL"}
`,
  };
}
