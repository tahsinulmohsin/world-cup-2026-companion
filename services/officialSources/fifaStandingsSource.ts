import { createOfficialSource } from "./baseSource";
import { normalizeStandings } from "@/services/normalizers/standings";
import fallbackStandings from "@/data/fallback/standings.json";
import type { SourceMeta, Standing } from "@/types";

export const fifaStandingsSource = createOfficialSource<Standing[]>({
  id: "fifa-standings",
  name: "FIFA Official Standings",
  envUrlKey: "OFFICIAL_FIFA_STANDINGS_URL",
  ttlMs: 5 * 60 * 1000,
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta: SourceMeta) => normalizeStandings(raw, meta),
  fallback: () => {
    const meta: SourceMeta = {
      sourceName: "Bundled sample data (development fallback)",
      sourceUrl: "",
      fetchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      reliability: "sample"
    };
    return normalizeStandings(fallbackStandings, meta);
  },
  count: (d) => d.length
});
