import Link from "next/link";
import TeamBadge from "@/components/teams/TeamBadge";
import FavoriteTeamButton from "@/components/teams/FavoriteTeamButton";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { getTeams } from "@/services/sync/syncService";

export const metadata = { title: "Teams" };
export const revalidate = 3600;

export default async function TeamsPage() {
  const res = await getTeams();
  const teams = (res.data ?? []).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Teams</h1>
          <p className="text-sm text-slate-500">All qualified teams — tap the star to follow yours.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={res.meta} />
          <LastUpdatedBadge iso={res.meta.fetchedAt} />
        </div>
      </header>
      {res.error && <ErrorState message={res.error} />}
      {teams.length === 0 ? (
        <EmptyState title="Teams unavailable" message="The qualified team list appears here from the official FIFA teams source." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
              <TeamBadge name={t.name} flag={t.flag} />
              <Link href={`/teams/${t.id}`} className="min-w-0 flex-1 hover:underline">
                <span className="block truncate font-semibold">{t.name}</span>
                <span className="block text-xs text-slate-500">{t.group ? `Group ${t.group}` : "Group TBC"}</span>
              </Link>
              <FavoriteTeamButton teamId={t.id} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
