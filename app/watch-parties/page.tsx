import WatchPartiesClient from "./WatchPartiesClient";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import { getWatchParties } from "@/services/sync/syncService";

function CommunitySourceBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l2.5 2.5" />
      </svg>
      Community Reported Watch Parties
    </span>
  );
}

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
          {res.meta.reliability === "official" ? <DataSourceBadge meta={res.meta} /> : <CommunitySourceBadge />}
          <LastUpdatedBadge iso={res.meta.fetchedAt} />
        </div>
      </header>
      <WatchPartiesClient parties={res.data ?? []} />
    </div>
  );
}
