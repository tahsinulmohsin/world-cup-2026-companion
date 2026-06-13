import FixturesClient from "./FixturesClient";
import ErrorState from "@/components/ui/ErrorState";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import { getFixtures, getStadiums, getTeams } from "@/services/sync/syncService";

export const metadata = { title: "Fixtures" };
export const revalidate = 300;

export default async function FixturesPage() {
  const [fixturesRes, teamsRes, stadiumsRes] = await Promise.all([getFixtures(), getTeams(), getStadiums()]);
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Fixtures</h1>
          <p className="text-sm text-slate-500">All 2026 World Cup matches, in your time.</p>
          <a
            href="webcal://world-cup-2026-companion-xi.vercel.app/api/calendar"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pitch-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-pitch-700 dark:bg-pitch-500 dark:text-night-950 dark:hover:bg-pitch-400"
          >
            <span aria-hidden>📅</span> Add all to Google Calendar
          </a>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={fixturesRes.meta} />
          <LastUpdatedBadge iso={fixturesRes.meta.fetchedAt} />
        </div>
      </header>
      {fixturesRes.error && <ErrorState message={fixturesRes.error} />}
      <FixturesClient
        fixtures={fixturesRes.data ?? []}
        teams={teamsRes.data ?? []}
        stadiums={stadiumsRes.data ?? []}
      />
    </div>
  );
}
