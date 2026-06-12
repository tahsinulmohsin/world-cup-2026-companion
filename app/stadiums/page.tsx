import StadiumCard from "@/components/stadiums/StadiumCard";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { getStadiums } from "@/services/sync/syncService";

export const metadata = { title: "Stadiums" };
export const revalidate = 3600;

export default async function StadiumsPage() {
  const res = await getStadiums();
  const stadiums = res.data ?? [];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Stadiums</h1>
          <p className="text-sm text-slate-500">16 venues across Mexico, Canada and the United States.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={res.meta} />
          <LastUpdatedBadge iso={res.meta.fetchedAt} />
        </div>
      </header>
      {res.error && <ErrorState message={res.error} />}
      {stadiums.length === 0 ? (
        <EmptyState title="Venues unavailable" message="Stadium information appears here from official venue sources." icon="🏟️" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stadiums.map((s) => <StadiumCard key={s.id} stadium={s} />)}
        </div>
      )}
    </div>
  );
}
