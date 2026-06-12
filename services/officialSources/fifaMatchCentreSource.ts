import { createOfficialSource } from "./baseSource";
import type { MatchCentreData } from "@/types";

/**
 * Match centre data (timeline, live stats, lineups, highlights links).
 * There is intentionally NO sample fallback: live match detail must come
 * from the official match centre or be shown as unavailable — never invented.
 */
export const fifaMatchCentreSource = createOfficialSource<MatchCentreData[]>({
  id: "fifa-match-centre",
  name: "FIFA Official Match Centre",
  envUrlKey: "OFFICIAL_FIFA_MATCH_CENTRE_URL",
  ttlMs: 60 * 1000, // 60s during live matches
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta) => {
    const list = Array.isArray(raw) ? raw : [(raw as Record<string, unknown>)];
    return list.flatMap((item) => {
      const r = item as Record<string, unknown>;
      if (typeof r.matchId !== "string") return [];
      const data: MatchCentreData = {
        matchId: r.matchId,
        timeline: Array.isArray(r.timeline)
          ? (r.timeline as Array<Record<string, unknown>>).flatMap((e, i) =>
              typeof e.eventType === "string"
                ? [{
                    id: typeof e.id === "string" ? e.id : `${r.matchId}-${i}`,
                    matchId: r.matchId as string,
                    minute: typeof e.minute === "string" ? e.minute : String(e.minute ?? ""),
                    eventType: e.eventType as MatchCentreData["timeline"][number]["eventType"],
                    teamId: typeof e.teamId === "string" ? e.teamId : null,
                    playerId: typeof e.playerId === "string" ? e.playerId : null,
                    playerName: typeof e.playerName === "string" ? e.playerName : null,
                    description: typeof e.description === "string" ? e.description : "",
                    sourceMeta: meta
                  }]
                : []
            )
          : [],
        stats:
          r.stats && typeof r.stats === "object"
            ? ({ matchId: r.matchId, ...(r.stats as object), sourceMeta: meta } as unknown as MatchCentreData["stats"])
            : null,
        lineupsConfirmed: r.lineupsConfirmed === true,
        highlightsUrl: typeof r.highlightsUrl === "string" ? r.highlightsUrl : null,
        goalClipsUrl: typeof r.goalClipsUrl === "string" ? r.goalClipsUrl : null,
        playerOfTheMatch: typeof r.playerOfTheMatch === "string" ? r.playerOfTheMatch : null,
        facts: Array.isArray(r.facts)
          ? (r.facts as Array<Record<string, unknown>>).flatMap((f) =>
              typeof f.fact === "string" ? [{ matchId: r.matchId as string, fact: f.fact, sourceMeta: meta }] : []
            )
          : [],
        headToHead: null,
        sourceMeta: meta
      };
      return [data];
    });
  },
  fallback: () => null,
  count: (d) => d.length
});
