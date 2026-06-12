"use client";

import KnockoutBracket from "@/components/knockout/KnockoutBracket";
import SpoilerScore from "@/components/matches/SpoilerScore";
import { sortGroup } from "@/services/normalizers/standings";
import type { Fixture, Stadium, Standing } from "@/types";

/** Printable digital wall chart: all groups + the knockout path. */
export default function WallChart({
  fixtures,
  standings,
  stadiums
}: {
  fixtures: Fixture[];
  standings: Standing[];
  stadiums: Record<string, Stadium | undefined>;
}) {
  const groups = Array.from(new Set(standings.map((s) => s.group))).sort();
  const finalMatch = fixtures.find((f) => f.round === "Final");

  return (
    <div className="space-y-8 print:text-black">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-pitch-700 px-4 py-2 text-sm font-semibold text-white dark:bg-pitch-500 dark:text-night-950"
        >
          🖨 Print / save as PDF
        </button>
        <button
          disabled
          title="Image export arrives in a future release"
          className="cursor-not-allowed rounded-full px-4 py-2 text-sm font-medium text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700"
        >
          🖼 Download as image (coming soon)
        </button>
        <button
          disabled
          title="Share links arrive in a future release"
          className="cursor-not-allowed rounded-full px-4 py-2 text-sm font-medium text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700"
        >
          🔗 Share wall chart (coming soon)
        </button>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Groups</h2>
        {groups.length === 0 ? (
          <p className="text-sm text-slate-500">Groups fill in automatically from official standings data.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <h3 className="mb-2 font-display text-sm font-bold">Group {g}</h3>
                <ol className="space-y-1 text-sm">
                  {sortGroup(standings.filter((s) => s.group === g)).map((s, i) => (
                    <li key={s.teamId} className="flex justify-between tabular-nums">
                      <span className="truncate">{i + 1}. {s.teamName}</span>
                      <span className="font-semibold">{s.points} pts</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Knockout path</h2>
        <KnockoutBracket fixtures={fixtures.filter((f) => f.isKnockout)} stadiums={stadiums} compact />
      </section>

      <section className="rounded-2xl border-2 border-trophy-500/60 p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-trophy-600 dark:text-trophy-400">🏆 World Cup 2026 winner</p>
        {finalMatch && finalMatch.status === "fulltime" ? (
          <div className="mt-2 font-display text-2xl font-extrabold">
            {finalMatch.winnerTeamId === finalMatch.homeTeamId ? finalMatch.homeTeamName : finalMatch.awayTeamName}
            <div className="mt-1"><SpoilerScore fixture={finalMatch} /></div>
          </div>
        ) : (
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-300 dark:text-slate-600">To be decided</p>
        )}
      </section>
    </div>
  );
}
