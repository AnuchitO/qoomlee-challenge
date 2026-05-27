import { describe, it, expect } from "vitest";
import { buildApiUrl } from "./buildApiUrl";

describe("buildApiUrl", () => {
  it("builds correct API URL from search params", () => {
    const url = buildApiUrl({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-06-15",
      passengers: "1",
    });

    expect(url).toBe(
      "http://localhost:8082/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"
    );
  });

  it.skip("maps 'departure' query param to 'date' API param", () => {
    const url = buildApiUrl({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-07-01",
      passengers: "2",
    });

    expect(url).toContain("date=2026-07-01");
    expect(url).not.toContain("departure=");
  });

  it.skip("uses NEXT_PUBLIC_QOOMLEE_API_URL env when set", () => {
    process.env.NEXT_PUBLIC_QOOMLEE_API_URL = "http://api.example.com";

    const url = buildApiUrl({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-06-15",
      passengers: "1",
    });

    expect(url).toStartWith("http://api.example.com");
    delete process.env.NEXT_PUBLIC_QOOMLEE_API_URL;
  });
});
