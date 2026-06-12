import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a `schedule(callback, delay)` function that runs `callback` after
 * `delay` ms. Any pending callback is cancelled on unmount or when a new
 * one is scheduled, so it never fires against an unmounted component.
 */
export function useDelayedAction() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((callback: () => void, delay: number) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      callback();
    }, delay);
  }, []);
}
