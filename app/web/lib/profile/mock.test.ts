import { describe, it, expect } from "vitest";
import { getProfile } from "./mock";

describe("getProfile", () => {
  it("returns the current user's profile data", () => {
    expect(getProfile()).toEqual({
      fullName: "Jonathan Doe",
      email: "jonathan.doe@email.com",
      phone: "+66 81 234 5678",
      nationality: "Thai",
      passportNumber: "AA123456",
      passportExpiry: "2030-12-31",
    });
  });
});
