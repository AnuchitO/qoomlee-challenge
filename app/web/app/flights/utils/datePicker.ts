import type { RefObject } from "react";

/**
 * Opens the native date-picker for the given input ref.
 * Falls back to focus() on browsers that block programmatic showPicker().
 */
export function showDatePicker(ref: RefObject<HTMLInputElement | null>): void {
  try {
    ref.current?.showPicker();
  } catch {
    ref.current?.focus();
  }
}
