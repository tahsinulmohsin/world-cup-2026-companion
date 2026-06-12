/**
 * Raw payload shapes expected from official source endpoints.
 *
 * These are intentionally loose: official feeds vary, so each adapter
 * validates the minimum shape it needs and the normalizer maps it into
 * the strict app models in `types/index.ts`. When you wire a real
 * official endpoint, tighten the matching Raw* type and validator.
 */

export interface RawFixture {
  id?: string | number;
  matchNumber?: number;
  home?: string;
  away?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  kickoffUTC?: string;
  date?: string;
  stadiumId?: string;
  venue?: string;
  group?: string;
  round?: string;
  status?: string;
  minute?: number;
  homeScore?: number | null;
  awayScore?: number | null;
  winnerTeamId?: string | null;
  lastUpdatedAt?: string;
  [key: string]: unknown;
}

export interface RawStanding {
  group?: string;
  teamId?: string;
  team?: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
  form?: string[];
  qualificationStatus?: string;
  [key: string]: unknown;
}

export interface RawTeam {
  id?: string;
  name?: string;
  shortName?: string;
  flag?: string;
  group?: string;
  coach?: string;
  ranking?: number;
  previousWorldCupPerformance?: string;
  form?: string[];
  [key: string]: unknown;
}

export interface RawPlayer {
  id?: string;
  teamId?: string;
  name?: string;
  position?: string;
  shirtNumber?: number;
  club?: string;
  age?: number;
  nationality?: string;
  isKeyPlayer?: boolean;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  appearances?: number;
  bio?: string;
  [key: string]: unknown;
}

export interface RawStadium {
  id?: string;
  name?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  capacity?: number;
  imageUrl?: string;
  mapUrl?: string;
  localInfo?: Record<string, string | null>;
  [key: string]: unknown;
}

export interface RawBroadcaster {
  countryCode?: string;
  countryName?: string;
  tvChannels?: string[];
  streamingPlatforms?: string[];
  notes?: string;
  languageOptions?: string[];
  isFree?: boolean;
  [key: string]: unknown;
}

export interface RawNewsItem {
  id?: string;
  title?: string;
  category?: string;
  summary?: string;
  description?: string;
  publishedAt?: string;
  pubDate?: string;
  imageUrl?: string;
  link?: string;
  url?: string;
  sourceName?: string;
  [key: string]: unknown;
}

export interface RawWatchParty {
  id?: string;
  title?: string;
  city?: string;
  country?: string;
  venue?: string;
  dateTime?: string;
  description?: string;
  kind?: string;
  mapUrl?: string;
  [key: string]: unknown;
}

export interface RawMatchCentre {
  matchId?: string;
  timeline?: Array<Record<string, unknown>>;
  stats?: Record<string, unknown> | null;
  lineupsConfirmed?: boolean;
  highlightsUrl?: string | null;
  goalClipsUrl?: string | null;
  playerOfTheMatch?: string | null;
  facts?: Array<{ fact?: string }>;
  headToHead?: Record<string, unknown> | null;
  [key: string]: unknown;
}
