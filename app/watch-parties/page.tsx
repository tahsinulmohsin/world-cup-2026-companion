import WatchPartiesClient from "./WatchPartiesClient";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import { getWatchParties } from "@/services/sync/syncService";

export const metadata = { title: "Watch Parties" };
export const revalidate = 1800;

export default async function WatchPartiesPage() {
  const res = await getWatchParties();
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Watch Party Finder</h1>
          <p className="text-sm text-slate-500">Official fan zones, screenings and community events.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={res.meta} />
          <LastUpdatedBadge iso={res.meta.fetchedAt} />
        </div>
      </header>
      <WatchPartiesClient parties={res.data ?? []} />
    </div>
  );
}
