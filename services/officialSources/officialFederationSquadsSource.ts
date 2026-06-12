import { createOfficialSource } from "./baseSource";
import { normalizePlayers } from "@/services/normalizers/players";
import fallbackPlayers from "@/data/fallback/players.json";
import type { Player, SourceMeta } from "@/types";

export const officialFederationSquadsSource = createOfficialSource<Player[]>({
  id: "federation-squads",
  name: "Official Federation Squads",
  envUrlKey: "OFFICIAL_FEDERATION_SQUADS_URL",
  ttlMs: 12 * 60 * 60 * 1000,
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta: SourceMeta) => normalizePlayers(raw, meta),
  fallback: () => {
    const meta: SourceMeta = {
      sourceName: "Bundled sample data (development fallback)",
      sourceUrl: "",
      fetchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      reliability: "sample"
    };
    return normalizePlayers(fallbackPlayers, meta);
  },
  count: (d) => d.length
});
