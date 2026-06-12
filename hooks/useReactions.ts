"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import type { FanReaction, ReactionType } from "@/types";

export function useReactions() {
  const [reactions, setReactions, hydrated] = useLocalStorage<FanReaction[]>(STORAGE_KEYS.reactions, []);

  const getReaction = useCallback(
    (matchId: string) => reactions.find((r) => r.matchId === matchId) ?? null,
    [reactions]
  );

  const react = useCallback(
    (matchId: string, reactionType: ReactionType, rating: number) => {
      setReactions((prev) => [
        ...prev.filter((r) => r.matchId !== matchId),
        { matchId, reactionType, rating, reactedAt: new Date().toISOString() }
      ]);
    },
    [setReactions]
  );

  return { reactions, getReaction, react, hydrated };
}
