import { describe, it, expect, afterEach } from "vitest";
import { buildApiUrl } from "./buildApiUrl";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_QOOMLEE_API_URL;
});

describe("buildApiUrl", () => {
  it("builds correct API URL from search params", () => {
    const url = buildApiUrl({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-06-15",
      passengers: "1",
    });

    expect(url).toBe(
      "http://localhost:8082/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1",
    );
  });

  it("maps 'departure' query param to 'date' API param", () => {
    const url = buildApiUrl({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-07-01",
      passengers: "2",
    });

    expect(url).toContain("date=2026-07-01");
    expect(url).not.toContain("departure=");
  });

  it("uses NEXT_PUBLIC_QOOMLEE_API_URL env when set", () => {
    process.env.NEXT_PUBLIC_QOOMLEE_API_URL = "http://api.example.com";

    const url = buildApiUrl({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-06-15",
      passengers: "1",
    });

    expect(url.startsWith("http://api.example.com")).toBe(true);
  });
});
