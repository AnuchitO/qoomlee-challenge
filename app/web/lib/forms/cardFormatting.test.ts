import { describe, it, expect } from "vitest";
import { formatCardNumber, formatExpiry, formatCvv, validateCardFields } from "./cardFormatting";

describe("formatCardNumber", () => {
  it("groups digits into chunks of 4 separated by spaces", () => {
    expect(formatCardNumber("1234567812345678")).toBe("1234 5678 1234 5678");
  });

  it("strips non-digit characters", () => {
    expect(formatCardNumber("1234-5678 1234x5678")).toBe("1234 5678 1234 5678");
  });

  it("truncates to 16 digits", () => {
    expect(formatCardNumber("12345678123456789999")).toBe("1234 5678 1234 5678");
  });

  it("does not leave a trailing space for partial input", () => {
    expect(formatCardNumber("12345")).toBe("1234 5");
  });
});

describe("formatExpiry", () => {
  it("inserts a slash after 2 digits", () => {
    expect(formatExpiry("1225")).toBe("12/25");
  });

  it("leaves input under 3 digits unchanged", () => {
    expect(formatExpiry("12")).toBe("12");
  });

  it("strips non-digit characters and truncates to 4 digits", () => {
    expect(formatExpiry("12/2599")).toBe("12/25");
  });
});

describe("formatCvv", () => {
  it("strips non-digit characters and truncates to 4 digits", () => {
    expect(formatCvv("12a3456")).toBe("1234");
  });
});

describe("validateCardFields", () => {
  const valid = {
    cardName: "Jonathan Doe",
    cardNumber: "1234 5678 1234 5678",
    expiry: "12/30",
    cvv: "123",
  };

  it("returns no errors for a fully valid form", () => {
    expect(validateCardFields(valid)).toEqual({});
  });

  it("flags an empty card name", () => {
    expect(validateCardFields({ ...valid, cardName: "  " }).cardName).toBeDefined();
  });

  it("flags a card number that isn't 16 digits", () => {
    expect(validateCardFields({ ...valid, cardNumber: "1234 5678" }).cardNumber).toBeDefined();
  });

  it("flags an expiry that isn't MM/YY", () => {
    expect(validateCardFields({ ...valid, expiry: "1230" }).expiry).toBeDefined();
  });

  it("flags a cvv that isn't 3 or 4 digits", () => {
    expect(validateCardFields({ ...valid, cvv: "12" }).cvv).toBeDefined();
  });
});
