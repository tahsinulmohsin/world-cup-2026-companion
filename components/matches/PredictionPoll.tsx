"use client";

import { usePredictions } from "@/hooks/usePredictions";
import type { Fixture } from "@/types";
import { cn } from "@/utils/cn";

/**
 * Local-only fan poll (MVP). Percentages are computed from this
 * browser's vote; the shapes are DB-ready so a shared backend can
 * aggregate community votes later.
 */
export default function PredictionPoll({ fixture }: { fixture: Fixture }) {
  const { getVote, castVote, clearVote, hydrated } = usePredictions();
  if (!hydrated) return null;
  const vote = getVote(fixture.id);

  const options = [
    { id: "home" as const, label: fixture.homeTeamName },
    { id: "draw" as const, label: "Draw" },
    { id: "away" as const, label: fixture.awayTeamName }
  ];

  const totalVotes = vote ? 1 : 0;

  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your prediction</p>
      <div className="space-y-1.5">
        {options.map((o) => {
          const pct = vote ? (vote.choice === o.id ? 100 : 0) : 0;
          return (
            <button
              key={o.id}
              onClick={() => castVote(fixture.id, o.id)}
              disabled={Boolean(vote)}
              className={cn(
                "relative block w-full overflow-hidden rounded-lg px-3 py-2 text-left text-sm ring-1 ring-inset transition",
                vote?.choice === o.id
                  ? "ring-pitch-600/50 font-semibold"
                  : "ring-slate-200 dark:ring-slate-700",
                !vote && "hover:bg-slate-50 dark:hover:bg-night-800"
              )}
            >
              <span
                className="absolute inset-y-0 left-0 bg-pitch-500/15 transition-all duration-500"
                style={{ width: `${pct}%` }}
                aria-hidden
              />
              <span className="relative flex justify-between">
                <span className="truncate">{o.label}</span>
                {vote && <span className="tabular-nums">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>{totalVotes} vote{totalVotes === 1 ? "" : "s"} on this device</span>
        {vote && (
          <button onClick={() => clearVote(fixture.id)} className="font-medium text-pitch-600 hover:underline dark:text-pitch-400">
            Change vote
          </button>
        )}
      </div>
    </div>
  );
}
