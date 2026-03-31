"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * A `useState`-like hook that persists its value to `localStorage`.
 *
 * - Synchronizes across tabs via the `storage` event.
 * - Falls back to `initialValue` when `localStorage` is unavailable (SSR, private browsing).
 * - Serialization: JSON.stringify / JSON.parse.
 *
 * @param key          - The `localStorage` key.
 * @param initialValue - Default value when nothing is stored yet.
 *
 * @example
 * ```tsx
 * const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("sidebar-collapsed", false);
 * const [theme, setTheme] = useLocalStorage<"light" | "dark" | "system">("theme", "system");
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize from storage (runs only once per mount).
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist to localStorage whenever the value changes.
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, JSON.stringify(nextValue));
          } catch {
            // Quota exceeded or private browsing — fail silently.
          }
        }
        return nextValue;
      });
    },
    [key],
  );

  // Sync across tabs: when another tab writes the same key, update local state.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      try {
        const newValue = event.newValue !== null ? (JSON.parse(event.newValue) as T) : initialValue;
        setStoredValue(newValue);
      } catch {
        // Corrupted value — reset to initial.
        setStoredValue(initialValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
