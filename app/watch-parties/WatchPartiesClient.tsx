"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import EmptyState from "@/components/ui/EmptyState";
import { useLocalWatchParties, type LocalWatchParty } from "@/hooks/useLocalWatchParties";
import type { CommunityWatchParty } from "@/services/community/watchPartyStore";
import type { WatchParty } from "@/types";

type DisplayParty =
  | WatchParty
  | (CommunityWatchParty & { _community: true })
  | (LocalWatchParty & { _local: true });

function AddPartyModal({ onClose, onSave }: { onClose: () => void; onSave: (party: Omit<LocalWatchParty, "id" | "createdAt">) => void }) {
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<LocalWatchParty["kind"]>("community");
  const [mapUrl, setMapUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim() || !city.trim()) {
      setError("Event name, venue, and city are required.");
      return;
    }
    setError("");
    onSave({
      title: title.trim(),
      venue: venue.trim(),
      city: city.trim(),
      country: country.trim() || "Unknown",
      dateTime: dateTime || null,
      organizer: organizer.trim() || null,
      description: description.trim(),
      kind,
      mapUrl: mapUrl.trim() || null,
    });
    onClose();
  };

  const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-night-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pitch-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-night-900" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
        <h2 className="font-display text-xl font-bold">Add a Watch Party</h2>
        <p className="mt-1 text-sm text-slate-500">Share where you&apos;re watching with the community.</p>

        {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Event name <span className="text-red-500">*</span></label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="World Cup Finals Watch Party" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Venue <span className="text-red-500">*</span></label>
              <input className={inputCls} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Sports Bar Downtown" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Organizer</label>
              <input className={inputCls} value={organizer} onChange={(e) => setOrganizer(e.target.value)} placeholder="Local Fan Club" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">City <span className="text-red-500">*</span></label>
              <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Country</label>
              <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Bangladesh" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Date & time</label>
              <input type="datetime-local" className={inputCls} value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as LocalWatchParty["kind"])}>
                <option value="fan_zone">Fan zone</option>
                <option value="sports_cafe">Sports café</option>
                <option value="university">University screening</option>
                <option value="community">Community event</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Map / location link</label>
            <input className={inputCls} value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea className={inputCls + " resize-none"} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Big screen, food, drinks, everyone welcome!" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-full bg-pitch-600 py-2.5 text-sm font-semibold text-white transition hover:bg-pitch-700 dark:bg-pitch-500 dark:text-night-950 dark:hover:bg-pitch-400">
              Add Watch Party
            </button>
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-medium ring-1 ring-inset ring-slate-300 hover:bg-slate-100 dark:ring-slate-700 dark:hover:bg-night-800">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WatchPartiesClient({ parties }: { parties: WatchParty[] }) {
  const [country, setCountry] = useState("all");
  const [city, setCity] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const { localParties, addParty, removeParty } = useLocalWatchParties();

  // Shared community parties loaded from the backend KV store (when configured).
  const [community, setCommunity] = useState<CommunityWatchParty[]>([]);
  const [shared, setShared] = useState(false);
  const [notice, setNotice] = useState("");

  const loadCommunity = useCallback(async () => {
    try {
      const res = await fetch("/api/watch-parties", { cache: "no-store" });
      const json = await res.json();
      setShared(Boolean(json.configured));
      setCommunity(Array.isArray(json.parties) ? json.parties : []);
    } catch {
      /* keep local-only behaviour on failure */
    }
  }, []);

  useEffect(() => {
    loadCommunity();
  }, [loadCommunity]);

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 4000);
  }, []);

  // Add: share via the backend when configured, else fall back to localStorage.
  const handleAdd = useCallback(
    async (input: Omit<LocalWatchParty, "id" | "createdAt">) => {
      if (!shared) {
        addParty(input);
        flash("Saved on this device only — a shared store isn't connected, so others won't see it yet.");
        return;
      }
      try {
        const res = await fetch("/api/watch-parties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });
        const json = await res.json();
        if (!res.ok) {
          flash(json.error || "Couldn't share the watch party. Please try again.");
          return;
        }
        setCommunity(Array.isArray(json.parties) ? json.parties : []);
        flash("Shared! Everyone visiting this page can now see your watch party.");
      } catch {
        flash("Network error — please try again.");
      }
    },
    [shared, addParty, flash]
  );

  // Merge official + shared community + device-local parties for display.
  const allParties: DisplayParty[] = useMemo(() => {
    const communityDisplay = community.map((c) => ({ ...c, _community: true as const }));
    const localDisplay = localParties.map((lp) => ({ ...lp, _local: true as const }));
    return [...parties, ...communityDisplay, ...localDisplay];
  }, [parties, community, localParties]);

  const countries = useMemo(() => Array.from(new Set(allParties.map((p) => p.country))).sort(), [allParties]);
  const cities = useMemo(
    () => Array.from(new Set(allParties.filter((p) => country === "all" || p.country === country).map((p) => p.city))).sort(),
    [allParties, country]
  );
  const filtered = allParties.filter((p) => (country === "all" || p.country === country) && (city === "all" || p.city === city));

  const select = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-night-900";

  const kindLabel: Record<string, string> = {
    fan_zone: "Fan zone",
    sports_cafe: "Sports café",
    university: "University screening",
    community: "Community event",
    other: "Watch event"
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Country" className={select} value={country} onChange={(e) => { setCountry(e.target.value); setCity("all"); }}>
          <option value="all">All countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="City" className={select} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setShowAdd(true)}
          className="ml-auto rounded-full bg-pitch-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pitch-700 dark:bg-pitch-500 dark:text-night-950 dark:hover:bg-pitch-400"
        >
          ➕ Add Watch Party
        </button>
      </div>

      {notice && (
        <p className="rounded-xl bg-pitch-50 px-3 py-2 text-sm font-medium text-pitch-700 dark:bg-pitch-900/30 dark:text-pitch-300">
          {notice}
        </p>
      )}
      {!shared && (
        <p className="text-xs text-slate-500">
          Watch parties you add are saved on this device only. To share them with everyone, connect a KV store
          (see the README) — added parties then appear for all visitors.
        </p>
      )}

      {filtered.length === 0 && (
        <EmptyState
          title="No watch parties yet"
          message="Be the first! Add a local watch party — share where you're watching with your friends and community."
          icon="🎉"
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const isLocal = "_local" in p;
          const isCommunity = "_community" in p;
          return (
            <article key={p.id} className="relative rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
              {isLocal && (
                <span className="absolute right-3 top-3 rounded-full bg-pitch-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pitch-700 dark:bg-pitch-900/30 dark:text-pitch-400">
                  Local
                </span>
              )}
              {isCommunity && (
                <span className="absolute right-3 top-3 rounded-full bg-trophy-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-trophy-700 dark:bg-trophy-500/20 dark:text-trophy-400">
                  Community
                </span>
              )}
              <p className="text-[11px] font-semibold uppercase tracking-wide text-trophy-600 dark:text-trophy-400">{kindLabel[p.kind] || "Watch event"}</p>
              <h3 className="mt-1 font-display text-base font-bold">{p.title}</h3>
              <p className="text-sm text-slate-500">{p.venue} · {p.city}, {p.country}</p>
              {"organizer" in p && p.organizer && (
                <p className="mt-1 text-sm"><span className="font-medium text-slate-700 dark:text-slate-300">Organized by:</span> {p.organizer}</p>
              )}
              {p.dateTime && <p className="mt-1 text-sm">📅 {new Date(p.dateTime).toLocaleString()}</p>}
              {p.description && <p className="mt-1 text-sm text-slate-500">{p.description}</p>}
              <div className="mt-2 flex items-center justify-between">
                {!isLocal && "sourceMeta" in p && <DataSourceBadge meta={p.sourceMeta} />}
                {isLocal && (
                  <button onClick={() => removeParty(p.id)} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400">
                    Remove
                  </button>
                )}
                {p.mapUrl && (
                  <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-pitch-600 hover:underline dark:text-pitch-400">Map ↗</a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {showAdd && <AddPartyModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
    </div>
  );
}
