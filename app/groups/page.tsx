import StandingTable from "@/components/standings/StandingTable";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import { getStandings } from "@/services/sync/syncService";

export const metadata = { title: "Groups & Standings" };
export const revalidate = 300;

export default async function GroupsPage() {
  const res = await getStandings();
  const standings = res.data ?? [];
  const groups = Array.from(new Set(standings.map((s) => s.group))).sort();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Groups & Standings</h1>
          <p className="text-sm text-slate-500">Twelve groups, top finishers and best third-placed teams advance.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={res.meta} />
          <LastUpdatedBadge iso={res.meta.fetchedAt} />
        </div>
      </header>
      {res.error && <ErrorState message={res.error} />}
      {groups.length === 0 ? (
        <EmptyState title="Standings unavailable" message="Group tables fill in automatically from official FIFA standings data." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {groups.map((g) => (
            <StandingTable key={g} group={g} rows={standings.filter((s) => s.group === g)} />
          ))}
        </div>
      )}
    </div>
  );
}
