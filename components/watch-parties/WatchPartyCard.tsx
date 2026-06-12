import DataSourceBadge from "@/components/ui/DataSourceBadge";
import type { WatchParty } from "@/types";

const kindLabel: Record<string, string> = {
  fan_zone: "Fan zone",
  sports_cafe: "Sports café",
  university: "University screening",
  community: "Community event",
  other: "Watch event"
};

export default function WatchPartyCard({ party }: { party: WatchParty }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-trophy-600 dark:text-trophy-400">{kindLabel[party.kind]}</p>
      <h3 className="mt-1 font-display text-base font-bold">{party.title}</h3>
      <p className="text-sm text-slate-500">{party.venue} · {party.city}, {party.country}</p>
      {party.dateTime && <p className="mt-1 text-sm">{new Date(party.dateTime).toLocaleString()}</p>}
      {party.description && <p className="mt-1 text-sm text-slate-500">{party.description}</p>}
      <div className="mt-2 flex items-center justify-between">
        <DataSourceBadge meta={party.sourceMeta} />
        {party.mapUrl && (
          <a href={party.mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-pitch-600 hover:underline dark:text-pitch-400">Map ↗</a>
        )}
      </div>
    </article>
  );
}
