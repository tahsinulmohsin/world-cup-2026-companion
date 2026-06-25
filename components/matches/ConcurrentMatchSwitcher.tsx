"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import TeamBadge from "@/components/teams/TeamBadge";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import type { Fixture, Team } from "@/types";

/**
 * Horizontal pill strip that lets users switch between matches
 * happening at the same kickoff time. Only renders when there are
 * 2+ concurrent matches.
 *
 * Concurrency is determined by exact `dateTimeUTC` match — the
 * World Cup schedule often has 2-4 group stage games at the
 * same hour on the final matchday of each group.
 */
export default function ConcurrentMatchSwitcher({
  currentFixtureId,
  concurrentFixtures,
  teams,
}: {
  currentFixtureId: string;
  concurrentFixtures: Fixture[];
  teams: Record<string, Team | undefined>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Scroll the active match into view on mount
  useEffect(() => {
    if (concurrentFixtures.length < 2) return;
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
    updateScrollButtons();
  }, [concurrentFixtures.length]);

  // Don't render if there's only the current match (no siblings)
  if (concurrentFixtures.length < 2) return null;

  function updateScrollButtons() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }

  const statusLabel: Record<string, string> = {
    live: "LIVE",
    halftime: "HT",
    fulltime: "FT",
    scheduled: "",
    postponed: "PPD",
  };

  return (
    <div className="relative rounded-2xl bg-white/80 shadow-card backdrop-blur-sm dark:bg-night-900/80 dark:shadow-card-dark">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 px-4 py-2.5 dark:border-slate-700/40">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          ⚡ Matches at this time
        </span>
        <Badge variant="neutral">
          {concurrentFixtures.length} simultaneous
        </Badge>
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left fade + arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-white via-white/80 to-transparent dark:from-night-900 dark:via-night-900/80"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right fade + arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-l from-white via-white/80 to-transparent dark:from-night-900 dark:via-night-900/80"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none"
        >
          {concurrentFixtures.map((f) => {
            const isCurrent = f.id === currentFixtureId;
            const home = f.homeTeamId ? teams[f.homeTeamId] : undefined;
            const away = f.awayTeamId ? teams[f.awayTeamId] : undefined;
            const sl = statusLabel[f.status] ?? "";
            const hasScore = f.homeScore !== null && f.awayScore !== null;

            return (
              <Link
                key={f.id}
                ref={isCurrent ? activeRef : undefined}
                href={`/matches/${f.id}`}
                className={cn(
                  "group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200",
                  isCurrent
                    ? "bg-pitch-700 text-white shadow-md ring-2 ring-pitch-500/40 dark:bg-pitch-600"
                    : "bg-slate-100/80 text-slate-700 hover:bg-pitch-50 hover:text-pitch-800 hover:shadow-sm dark:bg-night-800/60 dark:text-slate-300 dark:hover:bg-night-700/80"
                )}
                aria-current={isCurrent ? "page" : undefined}
              >
                {/* Live pulse indicator */}
                {f.status === "live" && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                )}

                {/* Home team */}
                <div className="flex items-center gap-1.5">
                  <TeamBadge name={f.homeTeamName} flag={home?.flag} size="sm" />
                  <span className={cn("font-semibold", isCurrent ? "text-white" : "")}>
                    {home?.shortName ?? f.homeTeamName.slice(0, 3).toUpperCase()}
                  </span>
                </div>

                {/* Score or VS */}
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold tabular-nums",
                  isCurrent ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                )}>
                  {hasScore ? (
                    <>
                      <span>{f.homeScore}</span>
                      <span className="text-[10px]">–</span>
                      <span>{f.awayScore}</span>
                    </>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wide">vs</span>
                  )}
                </div>

                {/* Away team */}
                <div className="flex items-center gap-1.5">
                  <span className={cn("font-semibold", isCurrent ? "text-white" : "")}>
                    {away?.shortName ?? f.awayTeamName.slice(0, 3).toUpperCase()}
                  </span>
                  <TeamBadge name={f.awayTeamName} flag={away?.flag} size="sm" />
                </div>

                {/* Status label */}
                {sl && (
                  <span className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    f.status === "live"
                      ? "bg-red-500/20 text-red-100"
                      : isCurrent
                        ? "bg-white/20 text-white/80"
                        : "bg-slate-200 text-slate-500 dark:bg-night-700 dark:text-slate-400"
                  )}>
                    {sl}{f.status === "live" && f.minute !== null ? ` ${f.minute}'` : ""}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
