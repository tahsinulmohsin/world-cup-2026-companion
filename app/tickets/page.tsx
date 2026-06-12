import DataSourceBadge from "@/components/ui/DataSourceBadge";
import { getTickets } from "@/services/sync/syncService";

export const metadata = { title: "Tickets" };
export const revalidate = 3600;

export default async function TicketsPage() {
  const res = await getTickets();
  const info = res.data;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Tickets & Hospitality</h1>
        <p className="text-sm text-slate-500">Official channels only — this app never links to resale platforms.</p>
      </header>

      <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
        ⚠️ Safety note: buy tickets only through FIFA's official ticketing and hospitality channels. Tickets from
        unofficial resellers may be invalid and are commonly used in scams.
      </div>

      {info && (
        <div className="grid gap-3 sm:grid-cols-2">
          <a href={info.officialTicketUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-pitch-700 p-5 text-white transition hover:bg-pitch-800 dark:bg-pitch-500 dark:text-night-950">
            <p className="text-2xl" aria-hidden>🎟️</p>
            <p className="mt-2 font-display text-lg font-bold">Official tickets</p>
            <p className="text-sm opacity-90">FIFA ticketing portal ↗</p>
          </a>
          <a href={info.officialHospitalityUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-night-900 p-5 text-white transition hover:bg-night-800">
            <p className="text-2xl" aria-hidden>🥂</p>
            <p className="mt-2 font-display text-lg font-bold">Official hospitality</p>
            <p className="text-sm opacity-90">FIFA hospitality packages ↗</p>
          </a>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-card dark:bg-night-900 dark:shadow-card-dark">
        <h2 className="font-display text-base font-bold">Availability</h2>
        <p className="mt-1 text-sm text-slate-500">
          {info?.availabilityNote ?? "Match-by-match availability appears here when the official ticketing feed is connected. Use the reminder button on any match card to set a ticket-day alert."}
        </p>
      </div>

      {info && <DataSourceBadge meta={info.sourceMeta} />}
    </div>
  );
}
