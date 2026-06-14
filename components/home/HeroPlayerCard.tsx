"use client";

import { useEffect, useState } from "react";

export interface HeroPlayer {
  url: string;
  name: string;
  sub?: string;
}

/**
 * Framed, cross-fading player-portrait card for the home hero (right side).
 * Rotates through a daily-shuffled set of squad portraits (Wikipedia).
 */
export default function HeroPlayerCard({ players }: { players: HeroPlayer[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (players.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % players.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [players.length]);

  if (players.length === 0) return null;

  const current = players[index];

  return (
    <div className="hidden w-44 shrink-0 sm:block lg:w-52">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-pitch-950 shadow-2xl ring-1 ring-white/20">
        {players.map((p, i) => (
          <div
            key={p.url}
            className={`absolute inset-0 bg-cover bg-top transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url("${p.url}")` }}
            aria-hidden={i !== index}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-950/95 via-night-950/50 to-transparent p-3 pt-8">
          <p className="font-display text-sm font-bold leading-tight">{current.name}</p>
          {current.sub && <p className="text-[11px] text-pitch-200">{current.sub}</p>}
        </div>
        <span className="absolute right-2 top-2 rounded-full bg-trophy-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-night-950">
          Star player
        </span>
      </div>
    </div>
  );
}
