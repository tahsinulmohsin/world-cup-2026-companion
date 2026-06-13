import Leaderboard, { UnavailableStat } from "@/components/stats/Leaderboard";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import { getSquads, getStandings, getFixtures, getTeams } from "@/services/sync/syncService";

export const metadata = { title: "Stats" };
export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [squadsRes, standingsRes, fixturesRes, teamsRes] = await Promise.all([
    getSquads(), getStandings(), getFixtures(), getTeams()
  ]);
  const standings = standingsRes.data ?? [];
  const fixtures = fixturesRes.data ?? [];
  const teams = teamsRes.data ?? [];

  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  // ── Tournament team stats (from standings) ──
  const teamGoals = [...standings]
    .filter((s) => s.played > 0)
    .sort((a, b) => b.goalsFor - a.goalsFor)
    .slice(0, 10)
    .map((s) => ({ label: s.teamName, sub: `Group ${s.group}`, value: s.goalsFor }));

  const bestDefense = [...standings]
    .filter((s) => s.played > 0)
    .sort((a, b) => a.goalsAgainst - b.goalsAgainst)
    .slice(0, 10)
    .map((s) => ({ label: s.teamName, sub: `Group ${s.group}`, value: s.goalsAgainst }));

  // ── Tournament match-level stats ──
  const finishedMatches = fixtures.filter((f) => f.status === "fulltime" && f.homeScore !== null && f.awayScore !== null);

  const highestScoringMatches = [...finishedMatches]
    .sort((a, b) => ((b.homeScore ?? 0) + (b.awayScore ?? 0)) - ((a.homeScore ?? 0) + (a.awayScore ?? 0)))
    .slice(0, 10)
    .map((f) => ({
      label: `${f.homeTeamName} vs ${f.awayTeamName}`,
      sub: f.round,
      value: (f.homeScore ?? 0) + (f.awayScore ?? 0)
    }));

  // Biggest wins
  const biggestWins = [...finishedMatches]
    .map((f) => ({
      ...f,
      diff: Math.abs((f.homeScore ?? 0) - (f.awayScore ?? 0)),
      winner: (f.homeScore ?? 0) > (f.awayScore ?? 0) ? f.homeTeamName : f.awayTeamName,
    }))
    .filter((f) => f.diff > 0)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 10)
    .map((f) => ({
      label: `${f.homeTeamName} ${f.homeScore}–${f.awayScore} ${f.awayTeamName}`,
      sub: f.round,
      value: f.diff
    }));

  // Team form: most points
  const teamForm = [...standings]
    .filter((s) => s.played > 0)
    .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
    .slice(0, 10)
    .map((s) => ({ label: s.teamName, sub: `Group ${s.group}`, value: s.points }));

  const totalGoals = finishedMatches.reduce((acc, f) => acc + (f.homeScore ?? 0) + (f.awayScore ?? 0), 0);
  const totalMatches = finishedMatches.length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Tournament Stats</h1>
          <p className="text-sm text-slate-500">Live tournament statistics from the 2026 FIFA World Cup.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={standingsRes.meta} />
          <LastUpdatedBadge iso={standingsRes.meta.fetchedAt} />
        </div>
      </header>

      {/* Quick summary */}
      {totalMatches > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white px-5 py-3 shadow-card dark:bg-night-900 dark:shadow-card-dark">
            <p className="text-2xl font-extrabold text-pitch-600 dark:text-pitch-400">{totalMatches}</p>
            <p className="text-xs text-slate-500">Matches played</p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-3 shadow-card dark:bg-night-900 dark:shadow-card-dark">
            <p className="text-2xl font-extrabold text-trophy-600 dark:text-trophy-400">{totalGoals}</p>
            <p className="text-xs text-slate-500">Goals scored</p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-3 shadow-card dark:bg-night-900 dark:shadow-card-dark">
            <p className="text-2xl font-extrabold text-pitch-600 dark:text-pitch-400">{totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : "–"}</p>
            <p className="text-xs text-slate-500">Goals per match</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teamGoals.length > 0 && <Leaderboard title="🔥 Team — most goals" rows={teamGoals} />}
        {bestDefense.length > 0 && <Leaderboard title="🧱 Team — best defense (GA)" rows={bestDefense} />}
        {teamForm.length > 0 && <Leaderboard title="📊 Team standings — points" rows={teamForm} />}
        {highestScoringMatches.length > 0 && <Leaderboard title="🎯 Highest scoring matches" rows={highestScoringMatches} />}
        {biggestWins.length > 0 && <Leaderboard title="💪 Biggest wins (goal diff)" rows={biggestWins} />}
        <UnavailableStat title="⚽ Top scorers (individual)" message="Individual goal scorers will appear once match event data is published by FIFA." />
        <UnavailableStat title="🅰️ Top assists (individual)" message="Assist leaders will appear once match event data is published by FIFA." />
        <UnavailableStat title="🧤 Most clean sheets" />
        <UnavailableStat title="🏅 Player of the match" />
      </div>
    </div>
  );
}
