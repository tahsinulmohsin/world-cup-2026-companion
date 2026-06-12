"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import { useFavorites } from "@/hooks/useFavorites";
import { sortGroup } from "@/services/normalizers/standings";
import type { Standing } from "@/types";
import { cn } from "@/utils/cn";

export default function StandingTable({ group, rows }: { group: string; rows: Standing[] }) {
  const { isFavorite } = useFavorites();
  const sorted = sortGroup(rows);

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card dark:bg-night-900 dark:shadow-card-dark">
      <header className="flex items-center justify-between px-4 py-3">
        <h3 className="font-display text-base font-bold">Group {group}</h3>
        {sorted[0] && <DataSourceBadge meta={sorted[0].sourceMeta} />}
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-y border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:border-night-800">
              <th className="px-4 py-2">#</th>
              <th className="py-2">Team</th>
              <th className="py-2 text-center">P</th>
              <th className="py-2 text-center">W</th>
              <th className="py-2 text-center">D</th>
              <th className="py-2 text-center">L</th>
              <th className="py-2 text-center">GF</th>
              <th className="py-2 text-center">GA</th>
              <th className="py-2 text-center">GD</th>
              <th className="py-2 text-center font-bold">Pts</th>
              <th className="py-2 pr-4">Form</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr
                key={s.teamId}
                className={cn(
                  "border-b border-slate-50 transition hover:bg-slate-50 dark:border-night-800/60 dark:hover:bg-night-800/50",
                  s.qualificationStatus === "qualified" && "bg-pitch-500/[0.06]",
                  s.qualificationStatus === "eliminated" && "opacity-55",
                  isFavorite(s.teamId) && "ring-1 ring-inset ring-trophy-500/40"
                )}
              >
                <td className="px-4 py-2.5 tabular-nums">{i + 1}</td>
                <td className="py-2.5">
                  <Link href={`/teams/${s.teamId}`} className="font-medium hover:underline">
                    {s.teamName}
                  </Link>{" "}
                  {s.qualificationStatus === "qualified" && <Badge variant="qualified">Q</Badge>}
                  {s.qualificationStatus === "eliminated" && <Badge variant="eliminated">E</Badge>}
                </td>
                <td className="py-2.5 text-center tabular-nums">{s.played}</td>
                <td className="py-2.5 text-center tabular-nums">{s.won}</td>
                <td className="py-2.5 text-center tabular-nums">{s.drawn}</td>
                <td className="py-2.5 text-center tabular-nums">{s.lost}</td>
                <td className="py-2.5 text-center tabular-nums">{s.goalsFor}</td>
                <td className="py-2.5 text-center tabular-nums">{s.goalsAgainst}</td>
                <td className="py-2.5 text-center tabular-nums">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
                <td className="py-2.5 text-center font-display font-bold tabular-nums">{s.points}</td>
                <td className="py-2.5 pr-4">
                  <span className="flex gap-0.5">
                    {s.form.slice(-5).map((r, j) => (
                      <span
                        key={j}
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold text-white",
                          r === "W" && "bg-pitch-600",
                          r === "D" && "bg-slate-400",
                          r === "L" && "bg-rose-500"
                        )}
                      >
                        {r}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[11px] text-slate-400">
        Tiebreakers: points → goal difference → goals scored. Qualification scenarios appear here once group play
        provides enough official data.
      </p>
    </section>
  );
}
