import { createOfficialSource } from "./baseSource";
import type { WatchParty } from "@/types";

export const officialWatchPartiesSource = createOfficialSource<WatchParty[]>({
  id: "official-watch-parties",
  name: "Official Fan Zones & Watch Events",
  envUrlKey: "OFFICIAL_WATCH_PARTIES_URL",
  ttlMs: 6 * 60 * 60 * 1000,
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta) => {
    const list = Array.isArray(raw) ? raw : [];
    return list.flatMap((item) => {
      const r = item as Record<string, unknown>;
      if (typeof r.id !== "string" || typeof r.title !== "string") return [];
      const kinds = ["fan_zone", "sports_cafe", "university", "community", "other"] as const;
      const kind = kinds.find((k) => k === r.kind) ?? "other";
      const wp: WatchParty = {
        id: r.id,
        title: r.title,
        city: typeof r.city === "string" ? r.city : "",
        country: typeof r.country === "string" ? r.country : "",
        venue: typeof r.venue === "string" ? r.venue : "",
        dateTime: typeof r.dateTime === "string" ? r.dateTime : null,
        description: typeof r.description === "string" ? r.description : "",
        kind,
        mapUrl: typeof r.mapUrl === "string" ? r.mapUrl : null,
        sourceMeta: meta
      };
      return [wp];
    });
  },
  fallback: () => null // empty state in UI — no invented events
});
