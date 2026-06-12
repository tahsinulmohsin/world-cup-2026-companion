"use client";

import { useMemo, useState } from "react";
import WatchPartyCard from "@/components/watch-parties/WatchPartyCard";
import EmptyState from "@/components/ui/EmptyState";
import type { WatchParty } from "@/types";

export default function WatchPartiesClient({ parties }: { parties: WatchParty[] }) {
  const [country, setCountry] = useState("all");
  const [city, setCity] = useState("all");

  const countries = useMemo(() => Array.from(new Set(parties.map((p) => p.country))).sort(), [parties]);
  const cities = useMemo(
    () => Array.from(new Set(parties.filter((p) => country === "all" || p.country === country).map((p) => p.city))).sort(),
    [parties, country]
  );
  const filtered = parties.filter((p) => (country === "all" || p.country === country) && (city === "all" || p.city === city));

  if (parties.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="No official watch events listed yet"
          message="Fan zones, sports cafés, university screenings and community events appear here from official and authorized event sources (OFFICIAL_WATCH_PARTIES_URL). We don't list unverified events."
          icon="🎉"
        />
        <div className="flex flex-wrap gap-2 text-sm">
          <button disabled className="cursor-not-allowed rounded-full px-4 py-2 font-medium text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700" title="Event submission arrives with the shared backend">➕ Add a watch party (coming soon)</button>
          <button disabled className="cursor-not-allowed rounded-full px-4 py-2 font-medium text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700" title="Saved events arrive with the shared backend">🔖 Saved events (coming soon)</button>
        </div>
      </div>
    );
  }

  const select = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-night-900";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select aria-label="Country" className={select} value={country} onChange={(e) => { setCountry(e.target.value); setCity("all"); }}>
          <option value="all">All countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="City" className={select} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => <WatchPartyCard key={p.id} party={p} />)}
      </div>
    </div>
  );
}
