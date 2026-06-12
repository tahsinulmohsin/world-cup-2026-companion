import { createOfficialSource } from "./baseSource";
import { normalizeFixtures } from "@/services/normalizers/fixtures";
import fallbackFixtures from "@/data/fallback/fixtures.json";
import type { Fixture, SourceMeta } from "@/types";

export const fifaFixturesSource = createOfficialSource<Fixture[]>({
  id: "fifa-fixtures",
  name: "FIFA Official Fixtures",
  envUrlKey: "OFFICIAL_FIFA_FIXTURES_URL",
  ttlMs: 15 * 60 * 1000, // 15 min during the tournament
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta: SourceMeta) => normalizeFixtures(raw, meta),
  fallback: () => {
    const meta: SourceMeta = {
      sourceName: "Bundled sample data (development fallback)",
      sourceUrl: "",
      fetchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      reliability: "sample"
    };
    return normalizeFixtures(fallbackFixtures, meta);
  },
  count: (d) => d.length,
  licenseNote: "Fixture data must come from official FIFA endpoints configured via environment variables."
});
