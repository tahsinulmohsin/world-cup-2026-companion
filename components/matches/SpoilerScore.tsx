"use client";

import { useState } from "react";
import { useSpoilerFree } from "@/hooks/usePreferences";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "@/hooks/useTranslation";
import type { Fixture } from "@/types";
import { cn } from "@/utils/cn";

/** Score display that honors spoiler-free mode with a blur + reveal flow. */
export default function SpoilerScore({ fixture, large = false }: { fixture: Fixture; large?: boolean }) {
  const { spoilerFree, favoritesOnly } = useSpoilerFree();
  const { isFavorite } = useFavorites();
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;
  if (!hasScore) {
    return <span className={cn("font-display font-bold tabular-nums", large ? "text-4xl" : "text-lg")}>vs</span>;
  }

  const involvesFavorite = isFavorite(fixture.homeTeamId) || isFavorite(fixture.awayTeamId);
  const shouldHide = spoilerFree && (!favoritesOnly || involvesFavorite) && !revealed;

  if (shouldHide) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setRevealed(true);
        }}
        className={cn(
          "rounded-lg bg-slate-200/80 px-3 font-display font-bold blur-none transition hover:bg-slate-300 dark:bg-night-800",
          large ? "py-2 text-base" : "py-1 text-xs"
        )}
      >
        {t("common.revealScore")}
      </button>
    );
  }

  return (
    <span className={cn("font-display font-bold tabular-nums", large ? "text-4xl" : "text-lg")}>
      {fixture.homeScore} – {fixture.awayScore}
    </span>
  );
}
