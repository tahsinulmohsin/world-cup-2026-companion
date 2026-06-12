"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/utils/cn";

export default function FavoriteTeamButton({ teamId, compact = false }: { teamId: string; compact?: boolean }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(teamId);
  return (
    <button
      onClick={() => toggleFavorite(teamId)}
      aria-pressed={fav}
      aria-label={fav ? "Remove from favorite teams" : "Add to favorite teams"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-trophy-500",
        compact ? "p-1.5" : "px-3 py-1.5 text-sm font-medium ring-1 ring-inset",
        fav
          ? compact
            ? "text-trophy-500"
            : "bg-trophy-500/15 text-trophy-700 ring-trophy-500/40 dark:text-trophy-300"
          : compact
            ? "text-slate-400 hover:text-trophy-500"
            : "text-slate-600 ring-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-night-800"
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 17.3 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9L12 2.5l2.9 6 6.5.9-4.7 4.6 1.1 6.5z" />
      </svg>
      {!compact && (fav ? "Favorite" : "Add favorite")}
    </button>
  );
}
