import { createOfficialSource } from "./baseSource";
import { normalizeStadiums } from "@/services/normalizers/stadiums";
import fallbackStadiums from "@/data/fallback/stadiums.json";
import type { SourceMeta, Stadium } from "@/types";

export const officialStadiumsSource = createOfficialSource<Stadium[]>({
  id: "official-stadiums",
  name: "Official Venue & Host City Information",
  envUrlKey: "OFFICIAL_STADIUMS_URL",
  ttlMs: 24 * 60 * 60 * 1000,
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta: SourceMeta) => normalizeStadiums(raw, meta),
  fallback: () => {
    const meta: SourceMeta = {
      sourceName: "Bundled venue reference data (public venue facts)",
      sourceUrl: "",
      fetchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      reliability: "sample",
      licenseNote: "Bundled venue list contains publicly known venue facts for development; configure the official venue source for production."
    };
    return normalizeStadiums(fallbackStadiums, meta);
  },
  count: (d) => d.length
});
