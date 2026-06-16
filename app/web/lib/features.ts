/**
 * Feature flags — controlled by NEXT_PUBLIC_* env vars so they are baked in
 * at build time and safe to read in client components.
 *
 * To enable: set the var to "true" in .env.local (or your deployment env).
 * Default (unset or any other value) → disabled.
 */

/** Show PromptPay / Bank Transfer / Other tabs on the payment page. */
export const FEATURE_ALT_PAYMENT_METHODS =
  process.env.NEXT_PUBLIC_ENABLE_ALT_PAYMENT_METHODS === "true";
