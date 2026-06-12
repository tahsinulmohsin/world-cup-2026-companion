import { createOfficialSource } from "./baseSource";
import { normalizeFixtures } from "@/services/normalizers/fixtures";
import {
  isOpenfootballPayload,
  normalizeOpenfootballFixtures
} from "@/services/normalizers/openfootball";
import fallbackFixtures from "@/data/fallback/fixtures.json";
import type { Fixture, SourceMeta } from "@/types";

/**
 * Fixtures adapter. Point OFFICIAL_FIFA_FIXTURES_URL at your configured
 * fixtures feed. Two payload shapes are supported out of the box:
 *  1. The generic JSON shape documented in types/sources (FIFA-style feeds)
 *  2. openfootball/worldcup.json (community dataset — user-approved source)
 */
export const fifaFixturesSource = createOfficialSource<Fixture[]>({
  id: "fifa-fixtures",
  name: "Configured fixtures source",
  envUrlKey: "OFFICIAL_FIFA_FIXTURES_URL",
  ttlMs: 15 * 60 * 1000,
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta: SourceMeta) =>
    isOpenfootballPayload(raw) ? normalizeOpenfootballFixtures(raw, meta) : normalizeFixtures(raw, meta),
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
  licenseNote: "Configure the fixtures endpoint via environment variables; attribution is shown in the UI."
});
