import PlayersClient from "./PlayersClient";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import ErrorState from "@/components/ui/ErrorState";
import { getSquads, getTeams } from "@/services/sync/syncService";

export const metadata = { title: "Players" };
export const revalidate = 3600;

export default async function PlayersPage() {
  const [squadsRes, teamsRes] = await Promise.all([getSquads(), getTeams()]);
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Players</h1>
          <p className="text-sm text-slate-500">Squads from official FIFA and federation announcements.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={squadsRes.meta} />
          <LastUpdatedBadge iso={squadsRes.meta.fetchedAt} />
        </div>
      </header>
      {squadsRes.error && <ErrorState message={squadsRes.error} />}
      <PlayersClient players={squadsRes.data ?? []} teams={teamsRes.data ?? []} />
    </div>
  );
}
