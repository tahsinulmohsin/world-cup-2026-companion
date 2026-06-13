import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import { getPlayer, getTeam } from "@/services/sync/syncService";

export const revalidate = 3600;

function Stat({ label, value }: { label: string; value: number | string | null }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-night-800/60">
      <p className="font-display text-xl font-extrabold tabular-nums">{value ?? "—"}</p>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id);
  if (!player) notFound();
  const team = await getTeam(player.teamId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-card dark:bg-night-900 dark:shadow-card-dark">
        <div className="flex items-center gap-4">
          <div className="flex shrink-0 items-center justify-center">
          {player.imageUrl ? (
            <img src={player.imageUrl} alt={player.name} className="h-16 w-16 rounded-full object-cover shadow-sm bg-white" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pitch-100 font-display text-2xl font-bold text-pitch-700 shadow-sm dark:bg-night-800 dark:text-pitch-300">
              {player.shirtNumber ?? "?"}
            </div>
          )}
        </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold">{player.name} {player.isKeyPlayer && <Badge variant="gold">Key player</Badge>}</h1>
            <p className="text-sm text-slate-500">
              {player.position ?? "Position TBC"} ·{" "}
              {team ? <Link href={`/teams/${team.id}`} className="hover:underline">{team.name}</Link> : player.teamId}
            </p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-[11px] uppercase tracking-wide text-slate-500">Club</dt><dd className="font-medium">{player.club ?? "—"}</dd></div>
          <div><dt className="text-[11px] uppercase tracking-wide text-slate-500">Age</dt><dd className="font-medium">{player.age ?? "—"}</dd></div>
          <div><dt className="text-[11px] uppercase tracking-wide text-slate-500">Nationality</dt><dd className="font-medium">{player.nationality ?? "—"}</dd></div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <DataSourceBadge meta={player.sourceMeta} />
          <LastUpdatedBadge iso={player.sourceMeta.fetchedAt} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold">Tournament stats</h2>
        <p className="mb-4 text-sm text-slate-500">Career international statistics published by the official source.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <Stat label="Apps" value={player.appearances} />
          <Stat label="Goals" value={player.goals} />
          <Stat label="Assists" value={player.assists} />
          <Stat label="Yellow" value={player.yellowCards} />
          <Stat label="Red" value={player.redCards} />
          <Stat label="Shirt" value={player.shirtNumber} />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Stats show &quot;—&quot; until published by the official tournament statistics source.</p>
      </section>
    </div>
  );
}
