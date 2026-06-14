import DataSourceBadge from "@/components/ui/DataSourceBadge";
import { getFixtures, getStadiums, getTickets } from "@/services/sync/syncService";
import { formatInTimezone } from "@/utils/time";

export const metadata = { title: "Tickets" };
export const revalidate = 3600;

const FIFA_TICKETS_URL = "https://www.fifa.com/tickets";

export default async function TicketsPage() {
  const [res, fixturesRes, stadiumsRes] = await Promise.all([getTickets(), getFixtures(), getStadiums()]);
  const info = res.data;

  const stadiums = Object.fromEntries((stadiumsRes.data ?? []).map((s) => [s.id, s]));
  const now = Date.now();
  // Honest "availability" = upcoming matches (tickets still relevant), from the
  // official fixtures feed. We never invent sold-out / seats-left numbers.
  const upcoming = (fixturesRes.data ?? [])
    .filter((f) => f.status === "scheduled" && new Date(f.dateTimeUTC).getTime() > now)
    .sort((a, b) => a.dateTimeUTC.localeCompare(b.dateTimeUTC))
    .slice(0, 12);
  const ticketUrl = info?.officialTicketUrl ?? FIFA_TICKETS_URL;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Tickets & Hospitality</h1>
        <p className="text-sm text-slate-500">Official channels only — this app never links to resale platforms.</p>
      </header>

      <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
        ⚠️ Safety note: buy tickets only through FIFA&apos;s official ticketing and hospitality channels. Tickets from
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
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Availability</h2>
          {upcoming.length > 0 && <span className="text-xs text-slate-500">{upcoming.length} upcoming</span>}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {info?.availabilityNote ??
            "Live seat counts require FIFA's official ticketing feed. Upcoming matches below link straight to the official ticketing portal — use the reminder button on any match card to set a ticket-day alert."}
        </p>

        {upcoming.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-night-800">
            {upcoming.map((f) => {
              const stadium = f.stadiumId ? stadiums[f.stadiumId] : undefined;
              return (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{f.homeTeamName} <span className="text-slate-400">v</span> {f.awayTeamName}</p>
                    <p className="truncate text-xs text-slate-500">
                      {formatInTimezone(f.dateTimeUTC, "UTC", { dateOnly: true })}
                      {stadium ? ` · ${stadium.name}, ${stadium.city}` : ""}
                    </p>
                  </div>
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full bg-pitch-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-pitch-700 dark:bg-pitch-500 dark:text-night-950 dark:hover:bg-pitch-400"
                  >
                    Buy via FIFA ↗
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No upcoming matches in the official fixtures feed right now.</p>
        )}
      </div>

      {info && <DataSourceBadge meta={info.sourceMeta} />}
    </div>
  );
}
