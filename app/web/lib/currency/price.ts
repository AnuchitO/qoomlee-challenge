/**
 * Utility functions for handling price formatting in the flight application
 */

import { logger } from "@/lib/logger/logger";

/**
 * Formats a price in minor units (cents) to a human-readable format
 * @param priceMinor - Price in minor units (e.g., cents)
 * @param currency - Currency code (e.g., USD, EUR, THB)
 * @returns Formatted price string (e.g., "$8,100.00")
 */
export function formatPrice(priceMinor: number, currency: string = "USD"): string {
  try {
    // Convert from minor units to major units (e.g., cents to dollars)
    const majorUnitPrice = priceMinor / 100;

    // Format according to currency
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(majorUnitPrice);
  } catch (error) {
    logger.error("Error formatting price", { error });
    // Fallback: return basic formatted string
    const majorUnitPrice = priceMinor / 100;
    return `${currency} ${majorUnitPrice.toFixed(2)}`;
  }
}

/**
 * Converts a price from major units to minor units
 * @param priceMajor - Price in major units (e.g., dollars)
 * @returns Price in minor units (e.g., cents)
 */
export function toMinorUnits(priceMajor: number): number {
  return Math.round(priceMajor * 100);
}

/**
 * Converts a price from minor units to major units
 * @param priceMinor - Price in minor units (e.g., cents)
 * @returns Price in major units (e.g., dollars)
 */
export function toMajorUnits(priceMinor: number): number {
  return priceMinor / 100;
}

/**
 * Formats a price for display with currency abbreviation
 * @param priceMinor - Price in minor units
 * @param currency - Currency code
 * @returns Formatted price with abbreviated currency (e.g., "THB 8,100")
 */
export function formatPriceAbbreviated(priceMinor: number, currency: string = "USD"): string {
  try {
    const majorUnitPrice = priceMinor / 100;
    const formattedAmount = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(majorUnitPrice);

    return `${currency} ${formattedAmount}`;
  } catch (error) {
    logger.error("Error formatting abbreviated price", { error });
    const majorUnitPrice = priceMinor / 100;
    return `${currency} ${Math.round(majorUnitPrice).toLocaleString()}`;
  }
}

/**
 * Compares two prices
 * @param priceAMinor - First price in minor units
 * @param priceBMinor - Second price in minor units
 * @returns -1 if A < B, 0 if A === B, 1 if A > B
 */
export function comparePrices(priceAMinor: number, priceBMinor: number): number {
  if (priceAMinor < priceBMinor) return -1;
  if (priceAMinor > priceBMinor) return 1;
  return 0;
}
