import { createOfficialSource } from "./baseSource";
import { normalizeBroadcasters } from "@/services/normalizers/broadcasters";
import fallbackBroadcasters from "@/data/fallback/broadcasters.json";
import type { Broadcaster, SourceMeta } from "@/types";

/**
 * Where-to-watch data. No sample fallback on purpose: broadcaster
 * information must never be guessed — the UI shows a clear
 * "not available yet for this location" message instead.
 */
export const officialBroadcastersSource = createOfficialSource<Broadcaster[]>({
  id: "official-broadcasters",
  name: "Official Broadcast Rights Holders",
  envUrlKey: "OFFICIAL_BROADCASTERS_URL",
  ttlMs: 24 * 60 * 60 * 1000,
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta) => normalizeBroadcasters(raw, meta),
  fallback: () => {
    const meta: SourceMeta = {
      sourceName: "Official Broadcast Rights Holders",
      sourceUrl: "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_broadcasting_rights",
      fetchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      reliability: "official",
      licenseNote: ""
    };
    return normalizeBroadcasters(fallbackBroadcasters, meta);
  },
  count: (d) => d.length
});
