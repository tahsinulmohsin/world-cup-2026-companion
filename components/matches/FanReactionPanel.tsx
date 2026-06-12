"use client";

import { useReactions } from "@/hooks/useReactions";
import { useSpoilerFree } from "@/hooks/usePreferences";
import type { Fixture, ReactionType } from "@/types";
import { cn } from "@/utils/cn";

const REACTIONS: Array<{ id: ReactionType; label: string; emoji: string }> = [
  { id: "great", label: "Great match", emoji: "🔥" },
  { id: "boring", label: "Boring", emoji: "🥱" },
  { id: "heartbreak", label: "Heartbreak", emoji: "💔" },
  { id: "shocking", label: "Shocking result", emoji: "😱" },
  { id: "masterclass", label: "Masterclass", emoji: "🎩" },
  { id: "drama", label: "Drama", emoji: "🎭" },
  { id: "underdog", label: "Underdog story", emoji: "🐺" }
];

/** Local-only fan mood (MVP) — DB-ready shape for later aggregation. */
export default function FanReactionPanel({ fixture }: { fixture: Fixture }) {
  const { getReaction, react, hydrated } = useReactions();
  const { spoilerFree } = useSpoilerFree();
  if (!hydrated) return null;
  if (fixture.status !== "fulltime") {
    return <p className="text-sm text-slate-500">Fan reactions open after the final whistle.</p>;
  }
  if (spoilerFree) {
    return <p className="text-sm text-slate-500">Fan reactions are hidden in spoiler-free mode (they can reveal the result).</p>;
  }
  const mine = getReaction(fixture.id);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => react(fixture.id, r.id, mine?.rating ?? 7)}
            aria-pressed={mine?.reactionType === r.id}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm ring-1 ring-inset transition",
              mine?.reactionType === r.id
                ? "bg-pitch-600/10 font-semibold ring-pitch-600/40"
                : "ring-slate-300 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-night-800"
            )}
          >
            {r.emoji} {r.label}
          </button>
        ))}
      </div>
      {mine && (
        <div className="mt-3">
          <label className="text-sm font-medium">
            Your rating: <span className="font-display font-bold">{mine.rating}/10</span>
            <input
              type="range" min={1} max={10} value={mine.rating}
              onChange={(e) => react(fixture.id, mine.reactionType, Number(e.target.value))}
              className="mt-1 w-full accent-pitch-600"
            />
          </label>
          <p className="mt-1 text-[11px] text-slate-500">
            Most common reaction on this device: {REACTIONS.find((r) => r.id === mine.reactionType)?.label}. Community
            percentages arrive when reactions connect to a shared backend.
          </p>
        </div>
      )}
    </div>
  );
}
