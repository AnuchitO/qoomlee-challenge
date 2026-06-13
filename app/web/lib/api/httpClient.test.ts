import { describe, it, expect, vi, afterEach } from "vitest";
import { getJson } from "./httpClient";
import { HttpError } from "./errors";

const mockFetch = (body: unknown, ok = true, status = 200) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  } as Response);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getJson", () => {
  it("returns ok(data) when the response is ok", async () => {
    mockFetch({ hello: "world" });

    const result = await getJson<{ hello: string }>("https://example.com/api");

    expect(result).toEqual({ ok: true, value: { hello: "world" } });
  });

  it("calls fetch with cache: no-store by default", async () => {
    const spy = mockFetch({});

    await getJson("https://example.com/api");

    const init = spy.mock.calls[0]![1] as RequestInit;
    expect(init?.cache).toBe("no-store");
  });

  it("merges a provided init with the default cache option", async () => {
    const spy = mockFetch({});

    await getJson("https://example.com/api", { headers: { Authorization: "Bearer token" } });

    const init = spy.mock.calls[0]![1] as RequestInit;
    expect(init?.cache).toBe("no-store");
    expect(init?.headers).toEqual({ Authorization: "Bearer token" });
  });

  it("returns err(BAD_STATUS) when the response is not ok", async () => {
    mockFetch({}, false, 404);

    const result = await getJson("https://example.com/api");

    expect(result).toEqual({
      ok: false,
      error: HttpError.badStatus(404, "API responded with status 404"),
    });
  });

  it("returns err(NETWORK_ERROR) when fetch throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const result = await getJson("https://example.com/api");

    expect(result).toEqual({
      ok: false,
      error: HttpError.networkError("Network error"),
    });
  });

  it("logs an error when the response is not ok", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch({}, false, 500);

    await getJson("https://example.com/api");

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("500"),
      expect.objectContaining({ status: 500 }),
    );
  });

  it("logs an error when fetch throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const networkError = new Error("Network error");
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(networkError);

    await getJson("https://example.com/api");

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("httpClient"),
      expect.objectContaining({ error: networkError }),
    );
  });
});
