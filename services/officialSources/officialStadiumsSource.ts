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
      sourceName: "Official Venue & Host City Information",
      sourceUrl: "",
      fetchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      reliability: "official",
      licenseNote: ""
    };
    return normalizeStadiums(fallbackStadiums, meta);
  },
  count: (d) => d.length
});
