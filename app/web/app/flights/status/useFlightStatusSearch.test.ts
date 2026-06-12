import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFlightStatusSearch } from "./useFlightStatusSearch";

describe("useFlightStatusSearch — performance: memoized filtering", () => {
  it("keeps the same filtered array reference across re-renders when query/searched are unchanged", () => {
    const { result, rerender } = renderHook(() => useFlightStatusSearch());

    const first = result.current.filtered;
    rerender();
    expect(result.current.filtered).toBe(first);
  });
});
