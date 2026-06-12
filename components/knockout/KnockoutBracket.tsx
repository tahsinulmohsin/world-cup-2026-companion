"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import SpoilerScore from "@/components/matches/SpoilerScore";
import { useFavorites } from "@/hooks/useFavorites";
import type { Fixture, Round, Stadium } from "@/types";
import { formatInTimezone } from "@/utils/time";
import { cn } from "@/utils/cn";

const ROUND_ORDER: Round[] = ["Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Third-place Match", "Final"];

export default function KnockoutBracket({
  fixtures,
  stadiums,
  compact = false
}: {
  fixtures: Fixture[];
  stadiums: Record<string, Stadium | undefined>;
  compact?: boolean;
}) {
  const { isFavorite } = useFavorites();
  const byRound = ROUND_ORDER.map((round) => ({
    round,
    matches: fixtures.filter((f) => f.round === round).sort((a, b) => a.dateTimeUTC.localeCompare(b.dateTimeUTC))
  })).filter((r) => r.matches.length > 0);

  if (byRound.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-700">
        Knockout pairings appear here automatically as official group results come in.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-6">
        {byRound.map(({ round, matches }) => (
          <div key={round} className={cn("flex flex-col justify-around gap-3", compact ? "w-44" : "w-56")}>
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">{round}</h3>
            {matches.map((m) => {
              const stadium = m.stadiumId ? stadiums[m.stadiumId] : undefined;
              const fav = isFavorite(m.homeTeamId) || isFavorite(m.awayTeamId);
              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className={cn(
                    "block rounded-xl bg-white p-3 text-sm shadow-card transition hover:-translate-y-0.5 dark:bg-night-900 dark:shadow-card-dark",
                    fav && "ring-2 ring-trophy-500/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn("truncate", m.winnerTeamId && m.winnerTeamId === m.homeTeamId && "font-bold")}>{m.homeTeamName}</p>
                      <p className={cn("truncate", m.winnerTeamId && m.winnerTeamId === m.awayTeamId && "font-bold")}>{m.awayTeamName}</p>
                    </div>
                    <SpoilerScore fixture={m} />
                  </div>
                  {!compact && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      {formatInTimezone(m.dateTimeUTC, "UTC", { dateOnly: true })} · {stadium?.city ?? "TBC"}
                      {m.status === "live" && <Badge variant="live" pulse className="ml-1.5">Live</Badge>}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
