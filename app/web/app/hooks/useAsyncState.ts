import { useState, useEffect, useCallback } from "react";
import { AppError } from "../../lib/errors/AppError";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

export function useAsyncState<T>(initialData: T | null = null) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError("Operation failed", "ASYNC_OPERATION_ERROR", { originalError: error });

      setState({ data: null, loading: false, error: appError });
      throw appError;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  return { ...state, execute, reset };
}
