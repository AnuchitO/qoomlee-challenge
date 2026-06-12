import { describe, it, expect } from "vitest";
import { getReviewPassengers, mockReviewPassengers } from "./mockPassengers";

describe("getReviewPassengers", () => {
  it("returns the review passengers for a booking reference", () => {
    expect(getReviewPassengers("QM1234")).toEqual(mockReviewPassengers);
  });
});
