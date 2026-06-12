import WallChart from "@/components/wallchart/WallChart";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import { getFixtures, getStadiums, getStandings } from "@/services/sync/syncService";

export const metadata = { title: "Wall Chart" };
export const revalidate = 600;

export default async function WallChartPage() {
  const [fixturesRes, standingsRes, stadiumsRes] = await Promise.all([getFixtures(), getStandings(), getStadiums()]);
  const stadiums = Object.fromEntries((stadiumsRes.data ?? []).map((s) => [s.id, s]));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Digital Wall Chart</h1>
        <p className="text-sm text-slate-500">Groups, knockout path and the road to the final — print it and pin it up.</p>
      </header>
      <WallChart fixtures={fixturesRes.data ?? []} standings={standingsRes.data ?? []} stadiums={stadiums} />
      <DataSourceBadge meta={fixturesRes.meta} />
    </div>
  );
}
