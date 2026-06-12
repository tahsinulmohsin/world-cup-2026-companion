import { createOfficialSource } from "./baseSource";
import fallbackTravel from "@/data/fallback/travel.json";
import type { TravelGuide } from "@/types";

export const officialTravelSource = createOfficialSource<TravelGuide[]>({
  id: "official-travel",
  name: "Official Host City Travel Information",
  envUrlKey: "OFFICIAL_TRAVEL_URL",
  ttlMs: 24 * 60 * 60 * 1000,
  validate: (raw) => Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta) => {
    const list = Array.isArray(raw) ? raw : [];
    return list.flatMap((item) => {
      const r = item as Record<string, unknown>;
      if (typeof r.stadiumId !== "string") return [];
      const guide: TravelGuide = {
        stadiumId: r.stadiumId,
        citySummary: typeof r.citySummary === "string" ? r.citySummary : null,
        matchdayChecklist: Array.isArray(r.matchdayChecklist)
          ? (r.matchdayChecklist as unknown[]).filter((x): x is string => typeof x === "string")
          : fallbackTravel.matchdayChecklist,
        sourceMeta: meta
      };
      return [guide];
    });
  },
  fallback: () => null
});

export const genericMatchdayChecklist: string[] = fallbackTravel.matchdayChecklist;
