"use client";

import { useEffect, useState } from "react";

type CommentaryItem = {
  id: string;
  time: string;
  text: string;
};

type MatchData = {
  id: string;
  name: string;
  shortName: string;
  state: "pre" | "in" | "post";
  clock: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
};

type MatchWithCommentary = {
  match: MatchData;
  commentary: CommentaryItem[];
};

type LivePayload = {
  active: boolean;
  message?: string;
  error?: string;
  /** Legacy single-match field (first match) */
  match?: MatchData;
  commentary?: CommentaryItem[];
  /** All matches with their commentary */
  matches?: MatchWithCommentary[];
};

export default function LiveCommentary() {
  const [data, setData] = useState<LivePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchLive = async () => {
      try {
        const res = await fetch("/api/live-commentary");
        const json = await res.json();
        if (mounted) {
          setData(json);
          setLoading(false);
          // Auto-select the first match if none selected or current one no longer exists
          if (json.matches && json.matches.length > 0) {
            setActiveMatchId((prev) => {
              if (!prev || !json.matches.find((m: MatchWithCommentary) => m.match.id === prev)) {
                return json.matches[0].match.id;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 30000); // 30s poll
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-night-900">
        <div className="h-6 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800/50"></div>
          <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800/50"></div>
          <div className="h-4 w-4/6 rounded bg-slate-100 dark:bg-slate-800/50"></div>
        </div>
      </div>
    );
  }

  // Resolve matches — support both new multi-match and legacy single-match format
  const allMatches: MatchWithCommentary[] =
    data?.matches && data.matches.length > 0
      ? data.matches
      : data?.match
        ? [{ match: data.match, commentary: data.commentary ?? [] }]
        : [];

  if (!data?.active || allMatches.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-night-900">
        <p className="text-sm text-slate-500">{data?.message || "Live commentary currently unavailable."}</p>
      </div>
    );
  }

  const activeEntry = allMatches.find((m) => m.match.id === activeMatchId) ?? allMatches[0];
  const { match, commentary } = activeEntry;
  const hasCommentary = commentary && commentary.length > 0;
  const hasMultipleMatches = allMatches.length > 1;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-night-900 dark:shadow-card-dark ${hasCommentary ? 'h-[440px]' : ''}`}>
      {/* Match switcher tabs — only shown when multiple matches are available */}
      {hasMultipleMatches && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50/80 px-3 py-2 scrollbar-none dark:border-slate-800 dark:bg-night-950/60">
          <span className="mr-1 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            ⚡ {allMatches.filter((m) => m.match.state === "in").length > 1 ? "Simultaneous matches" : "Matches"}
          </span>
          {allMatches.map((entry) => {
            const m = entry.match;
            const isActive = m.id === activeEntry.match.id;
            const isLive = m.state === "in";
            return (
              <button
                key={m.id}
                onClick={() => setActiveMatchId(m.id)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-pitch-700 text-white shadow-sm dark:bg-pitch-600"
                    : "text-slate-600 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-night-800"
                }`}
              >
                {isLive && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                )}
                <span>{m.homeTeam?.split(" ").slice(-1)[0]}</span>
                <span className={`text-[10px] tabular-nums ${isActive ? "text-white/70" : "text-slate-400"}`}>
                  {m.homeScore ?? "-"}:{m.awayScore ?? "-"}
                </span>
                <span>{m.awayTeam?.split(" ").slice(-1)[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Match header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-night-950/50">
        <div className="flex items-center gap-2">
          {match.state === "in" && (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
          )}
          <span className="font-display font-bold text-slate-900 dark:text-white">
            {match.state === "in" ? "LIVE" : match.state === "post" ? "FT" : "UPCOMING"}
          </span>
          <span className="text-sm font-medium text-slate-500">{match.clock}</span>
        </div>
        <div className="flex items-center gap-4 text-lg font-bold">
          <span className="text-slate-700 dark:text-slate-300">{match.homeTeam}</span>
          <span className="rounded bg-pitch-900 px-3 py-1 text-white dark:bg-pitch-800">
            {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
          </span>
          <span className="text-slate-700 dark:text-slate-300">{match.awayTeam}</span>
        </div>
      </div>

      {/* Content Feed */}
      <div className={`flex-1 overflow-y-auto p-4 ${hasCommentary ? "" : "py-12"}`}>
        {!hasCommentary ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No commentary events available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {commentary.map((item, i) => (
              <div key={item.id} className={`flex gap-3 text-sm ${i === 0 ? "font-medium text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                <div className="w-12 shrink-0 font-bold text-pitch-600 dark:text-pitch-400">
                  {item.time || "—"}
                </div>
                <div>{item.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-slate-50 p-2 text-center text-xs text-slate-400 dark:bg-night-950/50">
        Data provided by ESPN{hasMultipleMatches ? ` · ${allMatches.length} matches today` : ""}
      </div>
    </div>
  );
}
