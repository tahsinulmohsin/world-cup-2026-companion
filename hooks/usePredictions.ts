"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import type { PredictionVote } from "@/types";

/**
 * Local-only predictions for the MVP. The vote shape matches the
 * Prediction model so a database/API backend can replace this later
 * without UI changes.
 */
export function usePredictions() {
  const [votes, setVotes, hydrated] = useLocalStorage<PredictionVote[]>(STORAGE_KEYS.predictions, []);

  const getVote = useCallback((matchId: string) => votes.find((v) => v.matchId === matchId) ?? null, [votes]);

  const castVote = useCallback(
    (matchId: string, choice: PredictionVote["choice"]) => {
      setVotes((prev) => [
        ...prev.filter((v) => v.matchId !== matchId),
        { matchId, choice, votedAt: new Date().toISOString() }
      ]);
    },
    [setVotes]
  );

  const clearVote = useCallback(
    (matchId: string) => setVotes((prev) => prev.filter((v) => v.matchId !== matchId)),
    [setVotes]
  );

  return { votes, getVote, castVote, clearVote, hydrated };
}
