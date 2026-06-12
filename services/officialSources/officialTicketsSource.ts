import { createOfficialSource } from "./baseSource";
import type { TicketInfo } from "@/types";

const FIFA_TICKETS_URL = "https://www.fifa.com/tickets";
const FIFA_HOSPITALITY_URL = "https://hospitality.fifa.com";

export const officialTicketsSource = createOfficialSource<TicketInfo>({
  id: "official-tickets",
  name: "FIFA Official Ticketing",
  envUrlKey: "OFFICIAL_TICKETS_URL",
  ttlMs: 12 * 60 * 60 * 1000,
  validate: (raw) => typeof raw === "object" && raw !== null,
  normalize: (raw, meta) => {
    const r = raw as Record<string, unknown>;
    return {
      officialTicketUrl: typeof r.officialTicketUrl === "string" ? r.officialTicketUrl : FIFA_TICKETS_URL,
      officialHospitalityUrl:
        typeof r.officialHospitalityUrl === "string" ? r.officialHospitalityUrl : FIFA_HOSPITALITY_URL,
      availabilityNote: typeof r.availabilityNote === "string" ? r.availabilityNote : null,
      sourceMeta: meta
    };
  },
  fallback: () => ({
    officialTicketUrl: FIFA_TICKETS_URL,
    officialHospitalityUrl: FIFA_HOSPITALITY_URL,
    availabilityNote: null,
    sourceMeta: {
      sourceName: "FIFA official ticketing links",
      sourceUrl: FIFA_TICKETS_URL,
      fetchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      reliability: "official",
      licenseNote: "Links only — availability data requires the official ticketing feed."
    }
  })
});
