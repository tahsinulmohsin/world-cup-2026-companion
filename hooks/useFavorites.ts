"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/utils/constants";

export function useFavorites() {
  const [favorites, setFavorites, hydrated] = useLocalStorage<string[]>(STORAGE_KEYS.favorites, []);

  const toggleFavorite = useCallback(
    (teamId: string) => {
      setFavorites((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
    },
    [setFavorites]
  );

  const isFavorite = useCallback((teamId: string | null) => (teamId ? favorites.includes(teamId) : false), [favorites]);

  return { favorites, toggleFavorite, isFavorite, hydrated };
}
