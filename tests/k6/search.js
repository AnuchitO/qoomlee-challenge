/**
 * k6 load test — Flight Search
 * Tests: 100 virtual users over 30 seconds
 * Thresholds: p95 < 500ms, error rate < 1%
 *
 * Run: k6 run scripts/performance/search.js
 * Install k6: https://k6.io/docs/get-started/installation/
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const searchDuration = new Trend("search_duration", true);

export const options = {
  vus: 100,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],   // 95th percentile under 500ms
    http_req_failed: ["rate<0.01"],     // less than 1% errors
    errors: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.API_BASE || "http://localhost:8080";

const SEARCH_PARAMS = [
  { origin: "BKK", destination: "SIN", date: "2026-06-15" },
  { origin: "BKK", destination: "HKG", date: "2026-06-15" },
  { origin: "BKK", destination: "NRT", date: "2026-06-15" },
];

export default function () {
  const params = SEARCH_PARAMS[Math.floor(Math.random() * SEARCH_PARAMS.length)];
  const url = `${BASE_URL}/api/flights/search?origin=${params.origin}&destination=${params.destination}&date=${params.date}&passengers=1`;

  const start = Date.now();
  const res = http.get(url, {
    headers: { "Content-Type": "application/json" },
  });
  searchDuration.add(Date.now() - start);

  const ok = check(res, {
    "status is 200": (r) => r.status === 200,
    "response has flights array": (r) => {
      try {
        return JSON.parse(r.body).flights !== undefined;
      } catch {
        return false;
      }
    },
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  errorRate.add(!ok);
  sleep(0.3);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.["p(95)"] ?? 0;
  const errorRate = data.metrics.http_req_failed?.values?.rate ?? 0;
  const totalReqs = data.metrics.http_reqs?.values?.count ?? 0;

  const pass = p95 < 500 && errorRate < 0.01;

  return {
    stdout: `
Flight Search Load Test Results
────────────────────────────────
  Requests:      ${totalReqs}
  p50 latency:   ${(data.metrics.http_req_duration?.values?.["p(50)"] ?? 0).toFixed(0)}ms
  p95 latency:   ${p95.toFixed(0)}ms  ${p95 < 500 ? "✓" : "✗ (threshold: <500ms)"}
  Error rate:    ${(errorRate * 100).toFixed(2)}%  ${errorRate < 0.01 ? "✓" : "✗ (threshold: <1%)"}

  Result: ${pass ? "✓ PASS" : "✗ FAIL"}
`,
  };
}
