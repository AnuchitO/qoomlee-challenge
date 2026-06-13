import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "./logger";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logger", () => {
  it("info logs the message via console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.info("hello");

    expect(spy).toHaveBeenCalledWith("hello");
  });

  it("warn logs the message and meta via console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.warn("careful", { code: "X" });

    expect(spy).toHaveBeenCalledWith("careful", { code: "X" });
  });

  it("error logs the message and meta via console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error("boom", { reason: "network" });

    expect(spy).toHaveBeenCalledWith("boom", { reason: "network" });
  });

  it("error logs only the message when no meta is given", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error("boom");

    expect(spy).toHaveBeenCalledWith("boom");
  });
});
