import MyWorldCupDashboard from "@/components/my/MyWorldCupDashboard";
import { getFixtures, getNews, getStadiums, getStandings, getTeams } from "@/services/sync/syncService";

export const metadata = { title: "My World Cup" };
export const revalidate = 300;

export default async function MyWorldCupPage() {
  const [fixturesRes, teamsRes, standingsRes, stadiumsRes, newsRes] = await Promise.all([
    getFixtures(), getTeams(), getStandings(), getStadiums(), getNews()
  ]);
  const stadiums = Object.fromEntries((stadiumsRes.data ?? []).map((s) => [s.id, s]));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold">My World Cup</h1>
        <p className="text-sm text-slate-500">Your teams, your matches, your reminders — saved on this device.</p>
      </header>
      <MyWorldCupDashboard
        fixtures={fixturesRes.data ?? []}
        teams={teamsRes.data ?? []}
        standings={standingsRes.data ?? []}
        stadiums={stadiums}
        news={newsRes.data ?? []}
      />
    </div>
  );
}
