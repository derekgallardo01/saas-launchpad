"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a debounced version of `value` that only updates after `delay` ms
 * of inactivity. Useful for search inputs, filter fields, and any reactive
 * value that should not trigger expensive operations on every keystroke.
 *
 * @param value - The raw, rapidly-changing value.
 * @param delay - Debounce window in milliseconds (default: 300).
 * @returns The debounced value.
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 300);
 *
 * // Only fires the query when the user stops typing for 300 ms
 * const results = trpc.member.search.useQuery(
 *   { orgId, q: debouncedSearch },
 *   { enabled: debouncedSearch.length > 0 },
 * );
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Returns a debounced callback that delays invocation until after `delay` ms
 * since the last call. The callback is always invoked with the most recent
 * arguments. Pending invocations are cancelled on unmount.
 *
 * @param callback - The function to debounce.
 * @param delay    - Debounce window in milliseconds (default: 300).
 * @returns A stable debounced wrapper plus a `cancel` method.
 *
 * @example
 * ```tsx
 * const saveSettings = useDebouncedCallback(
 *   (settings: Settings) => trpc.settings.update.mutate(settings),
 *   500,
 * );
 * ```
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay = 300,
): { (...args: TArgs): void; cancel: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Cancel on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const debouncedFn = (...args: TArgs) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
  };

  debouncedFn.cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return debouncedFn;
}
