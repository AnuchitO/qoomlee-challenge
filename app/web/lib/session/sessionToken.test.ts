import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSessionToken, authHeaders } from "./sessionToken";

const STORAGE_KEY = "qoomlee:session:token";

describe("getSessionToken", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("generates and persists a token on first call", () => {
    const token = getSessionToken();

    expect(token).toBeTruthy();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(token);
  });

  it("returns the same token on subsequent calls", () => {
    const first = getSessionToken();
    const second = getSessionToken();

    expect(second).toBe(first);
  });

  it("reuses a token already present in localStorage", () => {
    window.localStorage.setItem(STORAGE_KEY, "existing-token");

    expect(getSessionToken()).toBe("existing-token");
  });

  it("returns an empty string when window is unavailable", () => {
    const original = globalThis.window;
    // @ts-expect-error simulating SSR
    delete globalThis.window;

    expect(getSessionToken()).toBe("");

    globalThis.window = original;
  });
});

describe("authHeaders", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an Authorization header with the session token", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "11111111-1111-1111-1111-111111111111",
    );

    expect(authHeaders()).toEqual({
      Authorization: "Bearer 11111111-1111-1111-1111-111111111111",
    });
  });
});
