"use client";

import { useCallback, useEffect, useState } from "react";
import { readJSON, writeJSON, STORAGE_EVENT } from "@/utils/storage";

/** localStorage-backed state that stays in sync across components/tabs. */
export function useLocalStorage<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readJSON<T>(key, fallback));
    setHydrated(true);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (!detail || detail.key === key) setValue(readJSON<T>(key, fallback));
    };
    window.addEventListener(STORAGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        writeJSON(key, next);
        return next;
      });
    },
    [key]
  );

  return [value, set, hydrated];
}
