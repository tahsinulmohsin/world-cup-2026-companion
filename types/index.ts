/** Core normalized data models for the World Cup 2026 Companion. */

export type Reliability = "official" | "sample" | "unavailable";

export interface SourceMeta {
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string; // ISO timestamp of when we fetched
  lastUpdatedAt: string; // ISO timestamp of last data change (if known)
  reliability: Reliability;
  licenseNote?: string;
}

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "fulltime"
  | "postponed"
  | "unknown";

export type Round =
  | "Group Stage"
  | "Round of 32"
  | "Round of 16"
  | "Quarter-final"
  | "Semi-final"
  | "Third-place Match"
  | "Final";

export type QualificationStatus =
  | "qualified"
  | "eliminated"
  | "in_contention"
  | "unknown";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  /** Emoji flag or null → neutral placeholder badge is rendered. */
  flag: string | null;
  group: string | null;
  coach: string | null;
  ranking: number | null;
  previousWorldCupPerformance: string | null;
  form: string[]; // e.g. ["W","D","L"]
  sourceMeta: SourceMeta;
}

export interface Fixture {
  id: string;
  matchNumber: number | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeamName: string;
  awayTeamName: string;
  dateTimeUTC: string;
  stadiumId: string | null;
  group: string | null;
  round: Round;
  status: MatchStatus;
  minute: number | null;
  homeScore: number | null;
  awayScore: number | null;
  isKnockout: boolean;
  winnerTeamId: string | null;
  importanceLabel: string | null;
  sourceMeta: SourceMeta;
}

export interface StadiumLocalInfo {
  nearestAirport: string | null;
  publicTransport: string | null;
  parking: string | null;
  attractions: string | null;
  food: string | null;
  hotels: string | null;
  safetyTips: string | null;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string; // IANA timezone of the venue
  capacity: number | null;
  imageUrl: string | null;
  mapUrl: string | null;
  hostedMatchIds: string[];
  localInfo: StadiumLocalInfo;
  sourceMeta: SourceMeta;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  position: string | null;
  shirtNumber: number | null;
  club: string | null;
  age: number | null;
  nationality: string | null;
  isKeyPlayer: boolean;
  imageUrl?: string | null;
  goals: number | null;
  assists: number | null;
  yellowCards: number | null;
  redCards: number | null;
  appearances: number | null;
  bio: string | null;
  sourceMeta: SourceMeta;
}

export interface Broadcaster {
  countryCode: string;
  countryName: string;
  tvChannels: string[];
  streamingPlatforms: string[];
  notes: string | null;
  languageOptions: string[];
  isFree: boolean | null;
  sourceMeta: SourceMeta;
}

export interface MatchFact {
  matchId: string;
  fact: string;
  sourceMeta: SourceMeta;
}

export interface Standing {
  group: string;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
  qualificationStatus: QualificationStatus;
  sourceMeta: SourceMeta;
}

export type TimelineEventType =
  | "goal"
  | "own_goal"
  | "penalty"
  | "assist"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "var_check"
  | "half_time"
  | "full_time"
  | "extra_time"
  | "penalty_shootout";

export interface TimelineEvent {
  id: string;
  matchId: string;
  minute: string; // "45+2", "90", etc.
  eventType: TimelineEventType;
  teamId: string | null;
  playerId: string | null;
  playerName: string | null;
  description: string;
  sourceMeta: SourceMeta;
}

export interface LiveStats {
  matchId: string;
  possessionHome: number | null;
  possessionAway: number | null;
  shotsHome: number | null;
  shotsAway: number | null;
  shotsOnTargetHome: number | null;
  shotsOnTargetAway: number | null;
  cornersHome: number | null;
  cornersAway: number | null;
  foulsHome: number | null;
  foulsAway: number | null;
  yellowsHome: number | null;
  yellowsAway: number | null;
  redsHome: number | null;
  redsAway: number | null;
  offsidesHome: number | null;
  offsidesAway: number | null;
  passAccuracyHome: number | null;
  passAccuracyAway: number | null;
  xgHome: number | null;
  xgAway: number | null;
  sourceMeta: SourceMeta;
}

export interface HeadToHeadMeeting {
  date: string;
  competition: string;
  score: string;
  winner: string | null;
}

export interface HeadToHead {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  lastMeetings: HeadToHeadMeeting[];
  worldCupMeetings: HeadToHeadMeeting[];
  allTimeRecord: { homeWins: number; draws: number; awayWins: number } | null;
  biggestWin: string | null;
  goalsInPreviousMeetings: number | null;
  rivalryFact: string | null;
  sourceMeta: SourceMeta;
}

export type NewsCategory =
  | "team_news"
  | "injury_update"
  | "lineup_update"
  | "match_preview"
  | "post_match_report"
  | "tournament_update"
  | "federation_update";

export interface NewsItem {
  id: string;
  title: string;
  category: NewsCategory;
  summary: string;
  publishedAt: string;
  imageUrl: string | null;
  sourceName: string;
  sourceUrl: string;
  teamIds?: string[];
}

export interface WatchParty {
  id: string;
  title: string;
  city: string;
  country: string;
  venue: string;
  dateTime: string | null;
  description: string;
  kind: "fan_zone" | "sports_cafe" | "university" | "community" | "other";
  mapUrl: string | null;
  sourceMeta: SourceMeta;
}

export interface MatchCentreData {
  matchId: string;
  timeline: TimelineEvent[];
  stats: LiveStats | null;
  lineupsConfirmed: boolean;
  highlightsUrl: string | null;
  goalClipsUrl: string | null;
  playerOfTheMatch: string | null;
  facts: MatchFact[];
  headToHead: HeadToHead | null;
  sourceMeta: SourceMeta;
}

export interface TravelGuide {
  stadiumId: string;
  citySummary: string | null;
  matchdayChecklist: string[];
  sourceMeta: SourceMeta;
}

export interface TicketInfo {
  officialTicketUrl: string;
  officialHospitalityUrl: string;
  availabilityNote: string | null;
  sourceMeta: SourceMeta;
}

/** Local-only models (stored in localStorage, DB-ready shapes). */
export type ReminderType =
  | "before_30"
  | "kickoff"
  | "goals"
  | "half_time"
  | "full_time"
  | "lineup"
  | "result"
  | "highlights";

export interface Reminder {
  matchId: string;
  reminderTypes: ReminderType[];
  reminderTime: string; // ISO – when first notification should fire
  createdAt: string;
}

export interface PredictionVote {
  matchId: string;
  choice: "home" | "draw" | "away";
  votedAt: string;
}

export type ReactionType =
  | "great"
  | "boring"
  | "heartbreak"
  | "shocking"
  | "masterclass"
  | "drama"
  | "underdog";

export interface FanReaction {
  matchId: string;
  reactionType: ReactionType;
  rating: number; // 1–10
  reactedAt: string;
}

/** Wrapper returned by every official source adapter. */
export interface SourceResult<T> {
  ok: boolean;
  data: T | null;
  meta: SourceMeta;
  error?: string;
}

export interface SourceStatus {
  id: string;
  name: string;
  envKey: string;
  configured: boolean;
  lastFetchAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  cacheState: "fresh" | "stale" | "empty";
  itemCount: number | null;
  ttlMs: number;
}
