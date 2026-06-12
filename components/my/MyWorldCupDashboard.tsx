"use client";

import Link from "next/link";
import MatchList from "@/components/matches/MatchList";
import StandingTable from "@/components/standings/StandingTable";
import EmptyState from "@/components/ui/EmptyState";
import TeamBadge from "@/components/teams/TeamBadge";
import FavoriteTeamButton from "@/components/teams/FavoriteTeamButton";
import { useFavorites } from "@/hooks/useFavorites";
import { useReminders } from "@/hooks/useReminders";
import { buildICS, downloadICS } from "@/utils/ics";
import type { Fixture, NewsItem, Stadium, Standing, Team } from "@/types";

export default function MyWorldCupDashboard({
  fixtures,
  teams,
  standings,
  stadiums,
  news
}: {
  fixtures: Fixture[];
  teams: Team[];
  standings: Standing[];
  stadiums: Record<string, Stadium | undefined>;
  news: NewsItem[];
}) {
  const { favorites, hydrated } = useFavorites();
  const { reminders } = useReminders();
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  if (!hydrated) return null;

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Pick your teams"
          message="Choose favorite teams below to build a personal dashboard: their matches, standings, reminders and news in one place."
          icon="⭐"
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-card dark:bg-night-900 dark:shadow-card-dark">
              <Link href={`/teams/${t.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                <TeamBadge name={t.name} flag={t.flag} size="sm" />
                <span className="truncate font-medium">{t.name}</span>
              </Link>
              <FavoriteTeamButton teamId={t.id} compact />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const favTeams = teams.filter((t) => favorites.includes(t.id));
  const favFixtures = fixtures
    .filter((f) => (f.homeTeamId && favorites.includes(f.homeTeamId)) || (f.awayTeamId && favorites.includes(f.awayTeamId)))
    .sort((a, b) => a.dateTimeUTC.localeCompare(b.dateTimeUTC));
  const liveFav = favFixtures.filter((f) => f.status === "live" || f.status === "halftime");
  const upcomingFav = favFixtures.filter((f) => f.status === "scheduled").slice(0, 6);
  const favGroups = Array.from(new Set(favTeams.map((t) => t.group).filter((g): g is string => Boolean(g))));
  const favNews = news.filter((n) => n.teamIds?.some((id) => favorites.includes(id)));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Your teams</h2>
        <div className="flex flex-wrap gap-2">
          {favTeams.map((t) => (
            <div key={t.id} className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-1 shadow-card dark:bg-night-900 dark:shadow-card-dark">
              <Link href={`/teams/${t.id}`} className="flex items-center gap-1.5 text-sm font-medium hover:underline">
                <TeamBadge name={t.name} flag={t.flag} size="sm" /> {t.name}
              </Link>
              <FavoriteTeamButton teamId={t.id} compact />
            </div>
          ))}
        </div>
        <button
          onClick={() => downloadICS(buildICS(favFixtures, stadiums, { calendarName: "My World Cup 2026 teams" }), "my-world-cup-2026.ics")}
          className="mt-3 rounded-full bg-pitch-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pitch-800 dark:bg-pitch-500 dark:text-night-950"
        >
          📅 Export my team matches (.ics)
        </button>
      </section>

      {liveFav.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Live now</h2>
          <MatchList fixtures={liveFav} stadiums={stadiums} teams={teamMap} />
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Upcoming matches</h2>
        <MatchList
          fixtures={upcomingFav}
          stadiums={stadiums}
          teams={teamMap}
          emptyTitle="No upcoming matches"
          emptyMessage="Your teams' next fixtures appear here from official data."
        />
      </section>

      {favGroups.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold">Your groups</h2>
          {favGroups.map((g) => (
            <StandingTable key={g} group={g} rows={standings.filter((s) => s.group === g)} />
          ))}
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Reminders</h2>
        {reminders.length === 0 ? (
          <p className="text-sm text-slate-500">No reminders yet — tap "Notify me" on any match card.</p>
        ) : (
          <p className="text-sm">
            {reminders.length} reminder{reminders.length === 1 ? "" : "s"} set ·{" "}
            <Link href="/reminders" className="text-pitch-600 hover:underline dark:text-pitch-400">manage</Link>
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Team news</h2>
        {favNews.length === 0 ? (
          <p className="text-sm text-slate-500">Official news tagged to your teams appears here once the news source is connected.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {favNews.slice(0, 5).map((n) => (
              <li key={n.id}>
                <a href={n.sourceUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">{n.title}</a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
