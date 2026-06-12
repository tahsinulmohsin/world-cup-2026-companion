import { createOfficialSource } from "./baseSource";
import { normalizeTeams } from "@/services/normalizers/teams";
import fallbackTeams from "@/data/fallback/teams.json";
import type { SourceMeta, Team } from "@/types";

export const fifaTeamsSource = createOfficialSource<Team[]>({
  id: "fifa-teams",
  name: "FIFA Official Teams",
  envUrlKey: "OFFICIAL_FIFA_TEAMS_URL",
  ttlMs: 12 * 60 * 60 * 1000,
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta: SourceMeta) => normalizeTeams(raw, meta),
  fallback: () => {
    const meta: SourceMeta = {
      sourceName: "Bundled sample data (development fallback)",
      sourceUrl: "",
      fetchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      reliability: "sample"
    };
    return normalizeTeams(fallbackTeams, meta);
  },
  count: (d) => d.length
});
