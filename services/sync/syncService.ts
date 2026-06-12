import { fifaFixturesSource } from "@/services/officialSources/fifaFixturesSource";
import { fifaStandingsSource } from "@/services/officialSources/fifaStandingsSource";
import { fifaMatchCentreSource } from "@/services/officialSources/fifaMatchCentreSource";
import { fifaTeamsSource } from "@/services/officialSources/fifaTeamsSource";
import { officialFederationSquadsSource } from "@/services/officialSources/officialFederationSquadsSource";
import { officialBroadcastersSource } from "@/services/officialSources/officialBroadcastersSource";
import { officialStadiumsSource } from "@/services/officialSources/officialStadiumsSource";
import { officialNewsSource } from "@/services/officialSources/officialNewsSource";
import { officialTicketsSource } from "@/services/officialSources/officialTicketsSource";
import { officialTravelSource } from "@/services/officialSources/officialTravelSource";
import { officialWatchPartiesSource } from "@/services/officialSources/officialWatchPartiesSource";
import { computeImportance } from "@/utils/importance";
import {
  computeStandingsFromFixtures,
  deriveTeamsFromFixtures
} from "@/services/normalizers/openfootball";
import type {
  Broadcaster, Fixture, MatchCentreData, NewsItem, Player,
  SourceResult, Stadium, Standing, Team, TicketInfo, TravelGuide, WatchParty
} from "@/types";

export type SyncScope =
  | "fixtures" | "standings" | "matchCentre" | "teams" | "squads"
  | "broadcasters" | "stadiums" | "news" | "tickets" | "travel" | "watchParties";

const sources = {
  fixtures: fifaFixturesSource,
  standings: fifaStandingsSource,
  matchCentre: fifaMatchCentreSource,
  teams: fifaTeamsSource,
  squads: officialFederationSquadsSource,
  broadcasters: officialBroadcastersSource,
  stadiums: officialStadiumsSource,
  news: officialNewsSource,
  tickets: officialTicketsSource,
  travel: officialTravelSource,
  watchParties: officialWatchPartiesSource
} as const;

export async function getFixtures(): Promise<SourceResult<Fixture[]>> {
  const [fixturesRes, standingsRes] = await Promise.all([
    fifaFixturesSource.fetchData(),
    fifaStandingsSource.fetchData()
  ]);
  if (fixturesRes.data) {
    const withImportance = computeImportance(fixturesRes.data, standingsRes.data ?? []);
    return { ...fixturesRes, data: withImportance };
  }
  return fixturesRes;
}

export async function getFixture(id: string): Promise<Fixture | null> {
  const res = await getFixtures();
  return res.data?.find((f) => f.id === id) ?? null;
}

export async function getStandings(): Promise<SourceResult<Standing[]>> {
  const res = await fifaStandingsSource.fetchData();
  // No dedicated standings feed configured → compute the tables from the
  // configured fixtures source's published results (derivation, not invention).
  if (res.meta.reliability !== "official") {
    const fixturesRes = await fifaFixturesSource.fetchData();
    if (fixturesRes.meta.reliability === "official" && fixturesRes.data) {
      const data = computeStandingsFromFixtures(fixturesRes.data, fixturesRes.meta);
      if (data.length > 0) {
        return { ok: true, data, meta: { ...fixturesRes.meta, sourceName: data[0].sourceMeta.sourceName } };
      }
    }
  }
  return res;
}

export async function getTeams(): Promise<SourceResult<Team[]>> {
  const res = await fifaTeamsSource.fetchData();
  // No dedicated teams feed configured → derive the team list from fixtures.
  if (res.meta.reliability !== "official") {
    const fixturesRes = await fifaFixturesSource.fetchData();
    if (fixturesRes.meta.reliability === "official" && fixturesRes.data) {
      const data = deriveTeamsFromFixtures(fixturesRes.data, fixturesRes.meta);
      if (data.length > 0) {
        return { ok: true, data, meta: { ...fixturesRes.meta, sourceName: data[0].sourceMeta.sourceName } };
      }
    }
  }
  return res;
}

export async function getTeam(id: string): Promise<Team | null> {
  const res = await getTeams();
  return res.data?.find((t) => t.id === id) ?? null;
}

export async function getSquads(): Promise<SourceResult<Player[]>> {
  return officialFederationSquadsSource.fetchData();
}

export async function getPlayer(id: string): Promise<Player | null> {
  const res = await getSquads();
  return res.data?.find((p) => p.id === id) ?? null;
}

export async function getStadiums(): Promise<SourceResult<Stadium[]>> {
  const [stadiumsRes, fixturesRes] = await Promise.all([
    officialStadiumsSource.fetchData(),
    fifaFixturesSource.fetchData()
  ]);
  if (stadiumsRes.data && fixturesRes.data) {
    const data = stadiumsRes.data.map((s) => ({
      ...s,
      hostedMatchIds: fixturesRes.data!.filter((f) => f.stadiumId === s.id).map((f) => f.id)
    }));
    return { ...stadiumsRes, data };
  }
  return stadiumsRes;
}

export async function getStadium(id: string): Promise<Stadium | null> {
  const res = await getStadiums();
  return res.data?.find((s) => s.id === id) ?? null;
}

export async function getBroadcasters(): Promise<SourceResult<Broadcaster[]>> {
  return officialBroadcastersSource.fetchData();
}

export async function getNews(): Promise<SourceResult<NewsItem[]>> {
  return officialNewsSource.fetchData();
}

export async function getMatchCentre(matchId: string): Promise<MatchCentreData | null> {
  const res = await fifaMatchCentreSource.fetchData();
  return res.data?.find((m) => m.matchId === matchId) ?? null;
}

export async function getTickets(): Promise<SourceResult<TicketInfo>> {
  return officialTicketsSource.fetchData();
}

export async function getTravelGuides(): Promise<SourceResult<TravelGuide[]>> {
  return officialTravelSource.fetchData();
}

export async function getWatchParties(): Promise<SourceResult<WatchParty[]>> {
  return officialWatchPartiesSource.fetchData();
}

/** Force-refresh a scope (used by cron jobs and the admin panel). */
export async function refreshScope(scope: SyncScope): Promise<{ scope: SyncScope; ok: boolean; error?: string; items?: number }> {
  const source = sources[scope];
  const res = await source.fetchData({ force: true });
  return {
    scope,
    ok: res.ok,
    error: res.error,
    items: Array.isArray(res.data) ? res.data.length : res.data ? 1 : 0
  };
}

export async function refreshAll(): Promise<Array<{ scope: SyncScope; ok: boolean; error?: string }>> {
  const scopes = Object.keys(sources) as SyncScope[];
  return Promise.all(scopes.map((s) => refreshScope(s)));
}
