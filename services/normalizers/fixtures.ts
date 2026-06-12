import type { Fixture, MatchStatus, Round, SourceMeta } from "@/types";
import { asArray, num, str } from "./helpers";

const ROUNDS: Round[] = [
  "Group Stage", "Round of 32", "Round of 16",
  "Quarter-final", "Semi-final", "Third-place Match", "Final"
];

function toRound(v: unknown): Round {
  const s = str(v);
  const found = ROUNDS.find((r) => r.toLowerCase() === (s ?? "").toLowerCase());
  return found ?? "Group Stage";
}

function toStatus(v: unknown): MatchStatus {
  const s = (str(v) ?? "").toLowerCase();
  if (["live", "in_play", "inplay", "1h", "2h"].includes(s)) return "live";
  if (["halftime", "ht", "half_time"].includes(s)) return "halftime";
  if (["fulltime", "ft", "finished", "full_time"].includes(s)) return "fulltime";
  if (["postponed", "suspended", "cancelled"].includes(s)) return "postponed";
  if (["scheduled", "upcoming", "ns", "not_started"].includes(s)) return "scheduled";
  return s ? "unknown" : "scheduled";
}

export function normalizeFixtures(raw: unknown, meta: SourceMeta): Fixture[] {
  return asArray(raw).flatMap((item) => {
    const r = item as Record<string, unknown>;
    const id = str(r.id) ?? (num(r.id) !== null ? String(num(r.id)) : null);
    const kickoff = str(r.kickoffUTC) ?? str(r.dateTimeUTC) ?? str(r.date);
    if (!id || !kickoff || Number.isNaN(Date.parse(kickoff))) return [];
    const round = toRound(r.round);
    const fixture: Fixture = {
      id,
      matchNumber: num(r.matchNumber),
      homeTeamId: str(r.homeTeamId),
      awayTeamId: str(r.awayTeamId),
      homeTeamName: str(r.home) ?? str(r.homeTeamName) ?? "TBD",
      awayTeamName: str(r.away) ?? str(r.awayTeamName) ?? "TBD",
      dateTimeUTC: new Date(kickoff).toISOString(),
      stadiumId: str(r.stadiumId) ?? str(r.venue),
      group: str(r.group),
      round,
      status: toStatus(r.status),
      minute: num(r.minute),
      homeScore: num(r.homeScore),
      awayScore: num(r.awayScore),
      isKnockout: round !== "Group Stage",
      winnerTeamId: str(r.winnerTeamId),
      importanceLabel: null, // computed later from context, never guessed
      sourceMeta: { ...meta, lastUpdatedAt: str(r.lastUpdatedAt) ?? meta.lastUpdatedAt }
    };
    return [fixture];
  });
}
