import { describe, it, expect } from "vitest";
import { formatCountdown, formatDeparture } from "./usePaymentClient";

/**
 * docs/stories/demo-story.md §4b — Unit layer, pure-function cases 1-2.
 *
 * The rest of usePaymentClient's behavior (booking lookup, redirects, charge
 * submission, promo codes) is already covered — more thoroughly than this
 * story proposes — by PaymentClient.test.tsx, which exercises the hook
 * through the rendered component. formatCountdown/formatDeparture are the
 * two pure exported functions worth testing directly: cheaper to run, and
 * precise about edge cases (zero-padding, UTC boundaries) that a rendered
 * assertion only checks incidentally.
 */

describe("formatCountdown", () => {
  it('case 1: formatCountdown(65) → "01:05" (zero-padded minutes and seconds)', () => {
    // Arrange
    const secondsLeft = 65;

    // Act
    const result = formatCountdown(secondsLeft);

    // Assert
    expect(result).toBe("01:05");
  });

  it('formatCountdown(0) → "00:00"', () => {
    expect(formatCountdown(0)).toBe("00:00");
  });
});

describe("formatDeparture", () => {
  it("case 2: formatDeparture renders the correct weekday/day/month across a UTC midnight boundary", () => {
    // Arrange — 2026-01-01T00:30:00Z: local midnight-adjacent time in most
    // western timezones would roll back to 2025-12-31 if this accidentally
    // used local time instead of UTC.
    const iso = "2026-01-01T00:30:00Z";

    // Act
    const result = formatDeparture(iso);

    // Assert
    expect(result).toBe("Thu 1 Jan");
  });
});
