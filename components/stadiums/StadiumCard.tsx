import Link from "next/link";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import StadiumClock from "./StadiumClock";
import type { Stadium } from "@/types";

export default function StadiumCard({ stadium }: { stadium: Stadium }) {
  return (
    <Link
      href={`/stadiums/${stadium.id}`}
      className="block overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-night-900 dark:shadow-card-dark"
    >
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-pitch-800 to-night-900 text-5xl" aria-hidden>
        🏟️
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-bold">{stadium.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{stadium.city}, {stadium.country}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Capacity</dt>
            <dd className="font-semibold tabular-nums">{stadium.capacity ? stadium.capacity.toLocaleString() : "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Matches</dt>
            <dd className="font-semibold tabular-nums">{stadium.hostedMatchIds.length || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Local time</dt>
            <dd className="font-semibold"><StadiumClock timezone={stadium.timezone} /></dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Weather</dt>
            <dd className="text-slate-400">Add weather API</dd>
          </div>
        </dl>
        <div className="mt-3"><DataSourceBadge meta={stadium.sourceMeta} /></div>
      </div>
    </Link>
  );
}
