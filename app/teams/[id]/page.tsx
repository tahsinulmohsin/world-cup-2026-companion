import { notFound } from "next/navigation";
import MatchList from "@/components/matches/MatchList";
import StandingTable from "@/components/standings/StandingTable";
import PlayerList from "@/components/players/PlayerList";
import TeamBadge from "@/components/teams/TeamBadge";
import FavoriteTeamButton from "@/components/teams/FavoriteTeamButton";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import NewsCard from "@/components/news/NewsCard";
import { getFixtures, getNews, getSquads, getStadiums, getStandings, getTeam, getTeams } from "@/services/sync/syncService";

export const revalidate = 600;

function Info({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-night-800/60">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value ?? <span className="font-normal text-slate-400">From official source</span>}</p>
    </div>
  );
}

export default async function TeamProfilePage({ params }: { params: { id: string } }) {
  const team = await getTeam(params.id);
  if (!team) notFound();

  const [fixturesRes, standingsRes, squadsRes, stadiumsRes, teamsRes, newsRes] = await Promise.all([
    getFixtures(), getStandings(), getSquads(), getStadiums(), getTeams(), getNews()
  ]);

  const fixtures = (fixturesRes.data ?? [])
    .filter((f) => f.homeTeamId === team.id || f.awayTeamId === team.id)
    .sort((a, b) => a.dateTimeUTC.localeCompare(b.dateTimeUTC));
  const results = fixtures.filter((f) => f.status === "fulltime");
  const upcoming = fixtures.filter((f) => f.status !== "fulltime");
  const stadiums = Object.fromEntries((stadiumsRes.data ?? []).map((s) => [s.id, s]));
  const teamMap = Object.fromEntries((teamsRes.data ?? []).map((t) => [t.id, t]));
  const squad = (squadsRes.data ?? []).filter((p) => p.teamId === team.id);
  const keyPlayers = squad.filter((p) => p.isKeyPlayer);
  const groupRows = (standingsRes.data ?? []).filter((s) => s.group === team.group);
  const teamNews = (newsRes.data ?? []).filter((n) => n.teamIds?.includes(team.id));

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-6 shadow-card dark:bg-night-900 dark:shadow-card-dark">
        <TeamBadge name={team.name} flag={team.flag} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold">{team.name}</h1>
          <p className="text-sm text-slate-500">{team.group ? `Group ${team.group}` : "Group TBC"} · World Cup 2026</p>
        </div>
        <FavoriteTeamButton teamId={team.id} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Coach" value={team.coach} />
        <Info label="Official ranking" value={team.ranking} />
        <Info label="Best World Cup" value={team.previousWorldCupPerformance} />
        <Info label="Form" value={team.form.length ? team.form.join(" ") : null} />
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <DataSourceBadge meta={team.sourceMeta} />
        <LastUpdatedBadge iso={team.sourceMeta.fetchedAt} />
      </div>

      {team.group && groupRows.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Group standing</h2>
          <StandingTable group={team.group} rows={groupRows} />
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Fixtures</h2>
        <MatchList fixtures={upcoming} stadiums={stadiums} teams={teamMap} emptyTitle="No upcoming fixtures" emptyMessage="Fixtures appear from the official schedule." />
      </section>

      {results.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Results</h2>
          <MatchList fixtures={results} stadiums={stadiums} teams={teamMap} />
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Squad{keyPlayers.length > 0 ? ` · key players: ${keyPlayers.map((p) => p.name).join(", ")}` : ""}</h2>
        <PlayerList players={squad} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Official team news</h2>
        {teamNews.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">{teamNews.slice(0, 4).map((n) => <NewsCard key={n.id} item={n} />)}</div>
        ) : (
          <p className="text-sm text-slate-500">News tagged to this team appears once the official news source is connected. Qualification route and head-to-head records also come from official sources.</p>
        )}
      </section>
    </div>
  );
}
