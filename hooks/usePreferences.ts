"use client";

import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS, type TimezoneMode } from "@/utils/constants";

export function useSpoilerFree() {
  const [spoilerFree, setSpoilerFree] = useLocalStorage<boolean>(STORAGE_KEYS.spoilerFree, false);
  const [favoritesOnly, setFavoritesOnly] = useLocalStorage<boolean>(STORAGE_KEYS.spoilerFavoritesOnly, false);
  return { spoilerFree, setSpoilerFree, favoritesOnly, setFavoritesOnly };
}

export function useTimezoneMode() {
  const [mode, setMode] = useLocalStorage<TimezoneMode>(STORAGE_KEYS.timezoneMode, "local");
  return { mode, setMode };
}

export function useWatchCountry() {
  const [country, setCountry] = useLocalStorage<string>(STORAGE_KEYS.watchCountry, "");
  return { country, setCountry };
}
