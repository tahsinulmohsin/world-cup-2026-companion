import type { Fixture, MatchStatus, Round, SourceMeta, Standing } from "@/types";
import { resolveTeamMeta } from "./openfootball";

/**
 * Normalizer for football-data.org v4 (user-approved third-party source,
 * free tier with API key). Used as a live-score overlay on top of the
 * base fixtures feed, or standalone when it's the only configured source.
 *
 * Matches: GET https://api.football-data.org/v4/competitions/WC/matches
 * Standings: GET https://api.football-data.org/v4/competitions/WC/standings
 */

const SOURCE_LABEL = "football-data.org (v4, World Cup competition)";

function toStatus(s: unknown): MatchStatus {
  switch (s) {
    case "IN_PLAY": return "live";
    case "PAUSED": return "halftime";
    case "FINISHED":
    case "AWARDED": return "fulltime";
    case "SUSPENDED":
    case "POSTPONED":
    case "CANCELLED": return "postponed";
    case "SCHEDULED":
    case "TIMED": return "scheduled";
    default: return "unknown";
  }
}

function toRound(stage: unknown): Round {
  switch (stage) {
    case "LAST_32": return "Round of 32";
    case "LAST_16": return "Round of 16";
    case "QUARTER_FINALS": return "Quarter-final";
    case "SEMI_FINALS": return "Semi-final";
    case "THIRD_PLACE": return "Third-place Match";
    case "FINAL": return "Final";
    default: return "Group Stage";
  }
}

const VENUE_HINTS: Array<[string, string]> = [
  ["azteca", "azteca"], ["ciudad de méxico", "azteca"],
  ["akron", "akron"], ["guadalajara", "akron"],
  ["bbva", "bbva"], ["monterrey", "bbva"],
  ["metlife", "metlife"], ["new york", "metlife"], ["new jersey", "metlife"],
  ["at&t", "att"], ["arlington", "att"], ["dallas", "att"],
  ["arrowhead", "arrowhead"], ["kansas city", "arrowhead"],
  ["nrg", "nrg"], ["houston", "nrg"],
  ["mercedes", "mercedes"], ["atlanta", "mercedes"],
  ["sofi", "sofi"], ["inglewood", "sofi"], ["los angeles", "sofi"],
  ["lincoln", "lincoln"], ["philadelphia", "lincoln"],
  ["lumen", "lumen"], ["seattle", "lumen"],
  ["levi", "levis"], ["santa clara", "levis"], ["san francisco", "levis"],
  ["gillette", "gillette"], ["foxborough", "gillette"], ["boston", "gillette"],
  ["hard rock", "hardrock"], ["miami", "hardrock"],
  ["bmo", "bmo"], ["toronto", "bmo"],
  ["bc place", "bcplace"], ["vancouver", "bcplace"]
];

function venueToStadiumId(venue: unknown): string | null {
  if (typeof venue !== "string") return null;
  const v = venue.toLowerCase();
  for (const [hint, id] of VENUE_HINTS) if (v.includes(hint)) return id;
  return null;
}

interface FDTeam { name?: string; tla?: string; shortName?: string }
interface FDMatch {
  id?: number;
  utcDate?: string;
  status?: string;
  minute?: number;
  matchday?: number;
  stage?: string;
  group?: string | null;
  venue?: string;
  homeTeam?: FDTeam;
  awayTeam?: FDTeam;
  score?: {
    winner?: string | null;
    fullTime?: { home?: number | null; away?: number | null };
  };
}

function fdTeamId(team: FDTeam | undefined): string | null {
  if (!team) return null;
  if (team.name) {
    const known = resolveTeamMeta(team.name) ?? (team.shortName ? resolveTeamMeta(team.shortName) : null);
    if (known) return known[0];
  }
  return team.tla ? team.tla.toLowerCase() : null;
}

export function isFootballDataMatchesPayload(raw: unknown): raw is { matches: FDMatch[] } {
  return typeof raw === "object" && raw !== null && Array.isArray((raw as { matches?: unknown }).matches);
}

export function normalizeFootballDataFixtures(raw: unknown, meta: SourceMeta): Fixture[] {
  if (!isFootballDataMatchesPayload(raw)) return [];
  const stamped: SourceMeta = { ...meta, sourceName: SOURCE_LABEL };

  return raw.matches.flatMap((m) => {
    if (typeof m.id !== "number" || typeof m.utcDate !== "string" || Number.isNaN(Date.parse(m.utcDate))) return [];
    const round = toRound(m.stage);
    const homeTeamId = fdTeamId(m.homeTeam);
    const awayTeamId = fdTeamId(m.awayTeam);
    const ft = m.score?.fullTime;
    const status = toStatus(m.status);
    const winnerTeamId =
      m.score?.winner === "HOME_TEAM" ? homeTeamId : m.score?.winner === "AWAY_TEAM" ? awayTeamId : null;

    const fixture: Fixture = {
      id: `fd-${m.id}`,
      matchNumber: null,
      homeTeamId,
      awayTeamId,
      homeTeamName: m.homeTeam?.name ?? "TBD",
      awayTeamName: m.awayTeam?.name ?? "TBD",
      dateTimeUTC: new Date(m.utcDate).toISOString(),
      stadiumId: venueToStadiumId(m.venue),
      group: typeof m.group === "string" ? m.group.replace(/^GROUP_/, "") : null,
      round,
      status,
      minute: typeof m.minute === "number" ? m.minute : null,
      homeScore: typeof ft?.home === "number" ? ft.home : null,
      awayScore: typeof ft?.away === "number" ? ft.away : null,
      isKnockout: round !== "Group Stage",
      winnerTeamId,
      importanceLabel: null,
      sourceMeta: stamped
    };
    return [fixture];
  });
}

export function normalizeFootballDataStandings(raw: unknown, meta: SourceMeta): Standing[] {
  const stamped: SourceMeta = { ...meta, sourceName: SOURCE_LABEL };
  const groups = (raw as { standings?: unknown })?.standings;
  if (!Array.isArray(groups)) return [];

  return groups.flatMap((g) => {
    const grp = g as { group?: string; type?: string; table?: unknown };
    if (grp.type && grp.type !== "TOTAL") return [];
    const groupName = typeof grp.group === "string" ? grp.group.replace(/^GROUP_/, "") : null;
    if (!groupName || !Array.isArray(grp.table)) return [];

    return (grp.table as Array<Record<string, unknown>>).flatMap((row) => {
      const team = row.team as FDTeam | undefined;
      const teamId = fdTeamId(team);
      if (!teamId || !team?.name) return [];
      const gf = typeof row.goalsFor === "number" ? row.goalsFor : 0;
      const ga = typeof row.goalsAgainst === "number" ? row.goalsAgainst : 0;
      const standing: Standing = {
        group: groupName,
        teamId,
        teamName: team.name,
        played: typeof row.playedGames === "number" ? row.playedGames : 0,
        won: typeof row.won === "number" ? row.won : 0,
        drawn: typeof row.draw === "number" ? row.draw : 0,
        lost: typeof row.lost === "number" ? row.lost : 0,
        goalsFor: gf,
        goalsAgainst: ga,
        goalDifference: typeof row.goalDifference === "number" ? row.goalDifference : gf - ga,
        points: typeof row.points === "number" ? row.points : 0,
        form: typeof row.form === "string" ? (row.form as string).split(",").filter(Boolean) : [],
        qualificationStatus: "in_contention",
        sourceMeta: stamped
      };
      return [standing];
    });
  });
}
