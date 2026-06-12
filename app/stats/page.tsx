import Leaderboard, { UnavailableStat } from "@/components/stats/Leaderboard";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import { getSquads, getStandings } from "@/services/sync/syncService";

export const metadata = { title: "Stats" };
export const revalidate = 600;

export default async function StatsPage() {
  const [squadsRes, standingsRes] = await Promise.all([getSquads(), getStandings()]);
  const players = squadsRes.data ?? [];
  const standings = standingsRes.data ?? [];

  const byStat = (key: "goals" | "assists" | "yellowCards" | "redCards") =>
    players
      .filter((p) => p[key] !== null && (p[key] as number) > 0)
      .sort((a, b) => (b[key] as number) - (a[key] as number))
      .slice(0, 10)
      .map((p) => ({ label: p.name, sub: p.nationality ?? undefined, value: p[key] as number }));

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

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Tournament Stats</h1>
          <p className="text-sm text-slate-500">Built only from official tournament statistics — sections appear as data is published.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={squadsRes.meta} />
          <LastUpdatedBadge iso={squadsRes.meta.fetchedAt} />
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Leaderboard title="⚽ Top scorers" rows={byStat("goals")} />
        <Leaderboard title="🅰️ Top assists" rows={byStat("assists")} />
        <Leaderboard title="🟨 Most yellow cards" rows={byStat("yellowCards")} />
        <Leaderboard title="🟥 Most red cards" rows={byStat("redCards")} />
        <Leaderboard title="🔥 Team — most goals" rows={teamGoals} />
        <Leaderboard title="🧱 Team — best defense (GA)" rows={bestDefense} />
        <UnavailableStat title="🧤 Most clean sheets" />
        <UnavailableStat title="🏅 Player of the match leaderboard" />
        <UnavailableStat title="🤝 Fair play ranking" />
        <UnavailableStat title="🎢 Most exciting matches" />
        <UnavailableStat title="🎯 Highest scoring matches" />
      </div>
    </div>
  );
}
