import DataSourceBadge from "@/components/ui/DataSourceBadge";
import StadiumClock from "./StadiumClock";
import StadiumWeather from "./StadiumWeather";
import type { Stadium } from "@/types";

function InfoRow({ label, value, isLink }: { label: string; value: string | null; isLink?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-night-800/60">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {value ? (
        isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-sm text-pitch-600 hover:underline dark:text-pitch-400 truncate">
            {value.includes('booking') ? 'View hotels ↗' : value.includes('tripadvisor') ? 'View restaurants ↗' : value.includes('openstreetmap') ? 'Find parking ↗' : value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm">{value}</p>
        )
      ) : (
        <p className="mt-0.5 text-sm text-slate-400">Available once the official source is connected</p>
      )}
    </div>
  );
}

export default function StadiumDetails({ stadium }: { stadium: Stadium }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoRow label="Host city" value={`${stadium.city}, ${stadium.country}`} />
        <InfoRow label="Capacity" value={stadium.capacity ? stadium.capacity.toLocaleString() : null} />
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-night-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Local time</p>
          <p className="mt-0.5 text-sm"><StadiumClock timezone={stadium.timezone} /> ({stadium.timezone})</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-night-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Weather</p>
          <div className="mt-0.5 text-sm"><StadiumWeather lat={stadium.latitude} lng={stadium.longitude} /></div>
        </div>
        <InfoRow label="Nearest airport" value={stadium.localInfo.nearestAirport} />
        <InfoRow label="Public transport" value={stadium.localInfo.publicTransport} />
        <InfoRow label="Parking" value={stadium.localInfo.parking} isLink={!!stadium.localInfo.parking?.startsWith('http')} />
        <InfoRow label="Nearby attractions" value={stadium.localInfo.attractions} />
        <InfoRow label="Food guide" value={stadium.localInfo.food} isLink={!!stadium.localInfo.food?.startsWith('http')} />
        <InfoRow label="Nearby hotels" value={stadium.localInfo.hotels} isLink={!!stadium.localInfo.hotels?.startsWith('http')} />
        <InfoRow label="Safety & travel tips" value={stadium.localInfo.safetyTips} />
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-night-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Map</p>
          {stadium.mapUrl ? (
            <a href={stadium.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-block text-sm text-pitch-600 hover:underline dark:text-pitch-400">Open map ↗</a>
          ) : (
            <p className="mt-0.5 text-sm text-slate-400">Map link appears once the official venue source provides it</p>
          )}
        </div>
      </div>
      <DataSourceBadge meta={stadium.sourceMeta} />
    </div>
  );
}
