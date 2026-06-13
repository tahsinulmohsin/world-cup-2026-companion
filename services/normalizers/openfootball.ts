import type { Fixture, Round, SourceMeta, Standing, Team } from "@/types";

/**
 * Normalizer for the openfootball/worldcup.json community dataset
 * (public domain, no API key): https://github.com/openfootball/worldcup.json
 *
 * Shape: { name, matches: [{ round, num?, date, time: "HH:MM UTC±H",
 *          team1, team2, group?: "Group A", ground, score?: { ft, ht, et?, pen? } }] }
 *
 * Notes:
 * - team1/team2 are plain names; knockout placeholders look like "1A", "2B",
 *   "3A/B/C/D/F", "W101", "UEFA Path D winner" — those get no team id.
 * - The dataset is updated roughly daily (not minute-live), so status is
 *   derived only from published results: full-time when a score exists,
 *   otherwise scheduled. We never fabricate "live" states.
 */

const SOURCE_LABEL = "openfootball/worldcup.json (community dataset, public domain)";

/** Known national teams: openfootball name → [id, shortName, flag]. */
const TEAMS: Record<string, [string, string, string]> = {
  "Mexico": ["mex", "MEX", "🇲🇽"], "South Africa": ["rsa", "RSA", "🇿🇦"],
  "South Korea": ["kor", "KOR", "🇰🇷"], "Czech Republic": ["cze", "CZE", "🇨🇿"],
  "Canada": ["can", "CAN", "🇨🇦"], "Switzerland": ["sui", "SUI", "🇨🇭"],
  "Qatar": ["qat", "QAT", "🇶🇦"], "Bosnia & Herzegovina": ["bih", "BIH", "🇧🇦"],
  "Bosnia and Herzegovina": ["bih", "BIH", "🇧🇦"],
  "Brazil": ["bra", "BRA", "🇧🇷"], "Morocco": ["mar", "MAR", "🇲🇦"],
  "Haiti": ["hai", "HAI", "🇭🇹"], "Scotland": ["sco", "SCO", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
  "USA": ["usa", "USA", "🇺🇸"], "United States": ["usa", "USA", "🇺🇸"],
  "Paraguay": ["par", "PAR", "🇵🇾"], "Australia": ["aus", "AUS", "🇦🇺"],
  "Turkey": ["tur", "TUR", "🇹🇷"], "Türkiye": ["tur", "TUR", "🇹🇷"],
  "Germany": ["ger", "GER", "🇩🇪"], "Curaçao": ["cuw", "CUW", "🇨🇼"], "Curacao": ["cuw", "CUW", "🇨🇼"],
  "Ivory Coast": ["civ", "CIV", "🇨🇮"], "Côte d'Ivoire": ["civ", "CIV", "🇨🇮"],
  "Ecuador": ["ecu", "ECU", "🇪🇨"], "Netherlands": ["ned", "NED", "🇳🇱"],
  "Japan": ["jpn", "JPN", "🇯🇵"], "Sweden": ["swe", "SWE", "🇸🇪"],
  "Tunisia": ["tun", "TUN", "🇹🇳"], "Belgium": ["bel", "BEL", "🇧🇪"],
  "Egypt": ["egy", "EGY", "🇪🇬"], "Iran": ["irn", "IRN", "🇮🇷"],
  "New Zealand": ["nzl", "NZL", "🇳🇿"], "Spain": ["esp", "ESP", "🇪🇸"],
  "Cape Verde": ["cpv", "CPV", "🇨🇻"], "Saudi Arabia": ["ksa", "KSA", "🇸🇦"],
  "Uruguay": ["uru", "URU", "🇺🇾"], "France": ["fra", "FRA", "🇫🇷"],
  "Senegal": ["sen", "SEN", "🇸🇳"], "Iraq": ["irq", "IRQ", "🇮🇶"],
  "Norway": ["nor", "NOR", "🇳🇴"], "Argentina": ["arg", "ARG", "🇦🇷"],
  "Algeria": ["alg", "ALG", "🇩🇿"], "Austria": ["aut", "AUT", "🇦🇹"],
  "Jordan": ["jor", "JOR", "🇯🇴"], "Portugal": ["por", "POR", "🇵🇹"],
  "DR Congo": ["cod", "COD", "🇨🇩"], "Uzbekistan": ["uzb", "UZB", "🇺🇿"],
  "Colombia": ["col", "COL", "🇨🇴"], "England": ["eng", "ENG", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
  "Croatia": ["cro", "CRO", "🇭🇷"], "Ghana": ["gha", "GHA", "🇬🇭"],
  "Panama": ["pan", "PAN", "🇵🇦"],
  // Possible playoff entrants, so late dataset updates resolve automatically:
  "Italy": ["ita", "ITA", "🇮🇹"], "Denmark": ["den", "DEN", "🇩🇰"],
  "Poland": ["pol", "POL", "🇵🇱"], "Ukraine": ["ukr", "UKR", "🇺🇦"],
  "Wales": ["wal", "WAL", "🏴󠁧󠁢󠁷󠁬󠁳󠁿"], "North Macedonia": ["mkd", "MKD", "🇲🇰"],
  "Romania": ["rou", "ROU", "🇷🇴"], "Slovakia": ["svk", "SVK", "🇸🇰"],
  "Albania": ["alb", "ALB", "🇦🇱"], "Kosovo": ["kos", "KOS", "🇽🇰"],
  "Republic of Ireland": ["irl", "IRL", "🇮🇪"], "Ireland": ["irl", "IRL", "🇮🇪"],
  "Bolivia": ["bol", "BOL", "🇧🇴"], "Suriname": ["sur", "SUR", "🇸🇷"],
  "New Caledonia": ["ncl", "NCL", "🇳🇨"], "Jamaica": ["jam", "JAM", "🇯🇲"]
};

/** openfootball "ground" city → bundled stadium id. */
const GROUNDS: Record<string, string> = {
  "Mexico City": "azteca",
  "Guadalajara (Zapopan)": "akron",
  "Monterrey (Guadalupe)": "bbva",
  "New York/New Jersey (East Rutherford)": "metlife",
  "Dallas (Arlington)": "att",
  "Kansas City": "arrowhead",
  "Houston": "nrg",
  "Atlanta": "mercedes",
  "Los Angeles (Inglewood)": "sofi",
  "Philadelphia": "lincoln",
  "Seattle": "lumen",
  "San Francisco Bay Area (Santa Clara)": "levis",
  "Boston (Foxborough)": "gillette",
  "Miami (Miami Gardens)": "hardrock",
  "Toronto": "bmo",
  "Vancouver": "bcplace"
};

interface OFMatch {
  round?: string;
  num?: number;
  date?: string;
  time?: string;
  team1?: string;
  team2?: string;
  group?: string;
  ground?: string;
  score?: { ft?: number[]; ht?: number[]; et?: number[]; pen?: number[] };
}

export function isOpenfootballPayload(raw: unknown): raw is { matches: OFMatch[] } {
  return (
    typeof raw === "object" && raw !== null &&
    Array.isArray((raw as { matches?: unknown }).matches) &&
    ((raw as { matches: unknown[] }).matches.length === 0 ||
      typeof ((raw as { matches: Array<Record<string, unknown>> }).matches[0]).team1 === "string")
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Resolve a national-team name to [id, shortName, flag], or null for placeholders. */
export function resolveTeamMeta(name: string): [string, string, string] | null {
  return TEAMS[name] ?? null;
}

function teamId(name: string | undefined): string | null {
  if (!name) return null;
  return TEAMS[name]?.[0] ?? null; // placeholders ("1A", "W101", "UEFA Path…") → null
}

/** "2026-06-11" + "13:00 UTC-6" → ISO UTC. Falls back to noon UTC if no time. */
function toUTC(date: string | undefined, time: string | undefined): string | null {
  if (!date) return null;
  const m = time?.match(/^(\d{1,2}):(\d{2})\s*UTC([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!m) {
    const d = Date.parse(`${date}T12:00:00Z`);
    return Number.isNaN(d) ? null : new Date(d).toISOString();
  }
  const [, hh, mm, sign, oh, om] = m;
  const iso = `${date}T${hh.padStart(2, "0")}:${mm}:00${sign}${oh.padStart(2, "0")}:${om ?? "00"}`;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function toRound(round: string | undefined, hasGroup: boolean): Round {
  const r = (round ?? "").toLowerCase();
  if (r.includes("final") && !r.includes("semi") && !r.includes("quarter")) {
    return r.includes("third") ? "Third-place Match" : "Final";
  }
  if (r.includes("third place")) return "Third-place Match";
  if (r.includes("semi")) return "Semi-final";
  if (r.includes("quarter")) return "Quarter-final";
  if (r.includes("round of 16")) return "Round of 16";
  if (r.includes("round of 32")) return "Round of 32";
  return hasGroup ? "Group Stage" : "Group Stage";
}

function winner(of: OFMatch, homeId: string | null, awayId: string | null): string | null {
  const decide = (a?: number[], b?: number[]) => (a && a.length === 2 ? a : b);
  const final = decide(of.score?.pen, decide(of.score?.et, of.score?.ft));
  if (!final || final.length !== 2 || final[0] === final[1]) return null;
  return final[0] > final[1] ? homeId : awayId;
}

export function normalizeOpenfootballFixtures(raw: unknown, meta: SourceMeta): Fixture[] {
  if (!isOpenfootballPayload(raw)) return [];
  const stamped: SourceMeta = { ...meta, sourceName: SOURCE_LABEL };

  return raw.matches.flatMap((of, i) => {
    const dateTimeUTC = toUTC(of.date, of.time);
    if (!dateTimeUTC || !of.team1 || !of.team2) return [];
    const group = of.group?.replace(/^Group\s+/i, "") ?? null;
    const round = toRound(of.round, Boolean(group));
    const homeTeamId = teamId(of.team1);
    const awayTeamId = teamId(of.team2);
    const ft = of.score?.ft;
    const hasResult = Array.isArray(ft) && ft.length === 2;

    const fixture: Fixture = {
      id: typeof of.num === "number" ? `m${of.num}` : `g-${of.date}-${slug(of.team1)}-${slug(of.team2)}`,
      matchNumber: typeof of.num === "number" ? of.num : null,
      homeTeamId,
      awayTeamId,
      homeTeamName: of.team1,
      awayTeamName: of.team2,
      dateTimeUTC,
      stadiumId: of.ground ? GROUNDS[of.ground] ?? null : null,
      group,
      round,
      status: hasResult ? "fulltime" : "scheduled",
      minute: null,
      homeScore: hasResult ? ft![0] : null,
      awayScore: hasResult ? ft![1] : null,
      isKnockout: round !== "Group Stage",
      winnerTeamId: hasResult ? winner(of, homeTeamId, awayTeamId) : null,
      importanceLabel: null,
      sourceMeta: stamped
    };
    return [fixture];
  });
}

/** Real teams (placeholders excluded) derived from the fixture list. */
export function deriveTeamsFromFixtures(fixtures: Fixture[], meta: SourceMeta): Team[] {
  const stamped: SourceMeta = { ...meta, sourceName: SOURCE_LABEL };
  const byId = new Map<string, Team>();
  for (const f of fixtures) {
    for (const [id, name] of [
      [f.homeTeamId, f.homeTeamName],
      [f.awayTeamId, f.awayTeamName]
    ] as Array<[string | null, string]>) {
      if (!id || byId.has(id)) continue;
      const known = TEAMS[name];
      byId.set(id, {
        id,
        name,
        shortName: known?.[1] ?? name.slice(0, 3).toUpperCase(),
        flag: known?.[2] ?? null,
        group: f.group,
        coach: null,
        ranking: null,
        previousWorldCupPerformance: null,
        form: [],
        sourceMeta: stamped
      });
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Group standings computed mechanically from published full-time results
 * (points, GD, goals). This is derivation, not invention: every number
 * traces back to a result in the source dataset.
 */
export function computeStandingsFromFixtures(fixtures: Fixture[], meta: SourceMeta): Standing[] {
  const stamped: SourceMeta = {
    ...meta,
    sourceName: `${SOURCE_LABEL} — standings computed from results`
  };
  const rows = new Map<string, Standing>();

  // Seed a row for every real team with a group.
  for (const f of fixtures) {
    if (!f.group) continue;
    for (const [id, name] of [
      [f.homeTeamId, f.homeTeamName],
      [f.awayTeamId, f.awayTeamName]
    ] as Array<[string | null, string]>) {
      if (!id || rows.has(id)) continue;
      rows.set(id, {
        group: f.group,
        teamId: id,
        teamName: name,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        form: [],
        qualificationStatus: "in_contention",
        sourceMeta: stamped
      });
    }
  }

  const finished = fixtures
    .filter((f) => f.group && f.status === "fulltime" && f.homeScore !== null && f.awayScore !== null)
    .sort((a, b) => a.dateTimeUTC.localeCompare(b.dateTimeUTC));

  for (const f of finished) {
    const home = f.homeTeamId ? rows.get(f.homeTeamId) : undefined;
    const away = f.awayTeamId ? rows.get(f.awayTeamId) : undefined;
    const hs = f.homeScore!;
    const aw = f.awayScore!;
    if (home) {
      home.played++; home.goalsFor += hs; home.goalsAgainst += aw;
      if (hs > aw) { home.won++; home.points += 3; home.form.push("W"); }
      else if (hs === aw) { home.drawn++; home.points += 1; home.form.push("D"); }
      else { home.lost++; home.form.push("L"); }
      home.goalDifference = home.goalsFor - home.goalsAgainst;
    }
    if (away) {
      away.played++; away.goalsFor += aw; away.goalsAgainst += hs;
      if (aw > hs) { away.won++; away.points += 3; away.form.push("W"); }
      else if (aw === hs) { away.drawn++; away.points += 1; away.form.push("D"); }
      else { away.lost++; away.form.push("L"); }
      away.goalDifference = away.goalsFor - away.goalsAgainst;
    }
  }

  return Array.from(rows.values());
}
