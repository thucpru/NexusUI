/**
 * use-api.ts
 * Generic API fetch wrapper hook with loading/error state.
 */

import { useState, useCallback } from 'preact/hooks';

export interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseApiReturn<T, A extends unknown[]> extends UseApiState<T> {
  execute: (...args: A) => Promise<T | null>;
  reset: () => void;
}

/** Wrap an async API function with loading and error state */
export function useApi<T, A extends unknown[] = []>(
  apiFn: (...args: A) => Promise<T>,
): UseApiReturn<T, A> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const data = await apiFn(...args);
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Unknown error';
        setState((s) => ({ ...s, isLoading: false, error: message }));
        return null;
      }
    },
    [apiFn],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
