import type { SourceMeta, Stadium } from "@/types";
import { asArray, num, str } from "./helpers";

export function normalizeStadiums(raw: unknown, meta: SourceMeta): Stadium[] {
  return asArray(raw).flatMap((item) => {
    const r = item as Record<string, unknown>;
    const id = str(r.id);
    const name = str(r.name);
    if (!id || !name) return [];
    const li = (r.localInfo ?? {}) as Record<string, unknown>;
    const stadium: Stadium = {
      id,
      name,
      city: str(r.city) ?? "",
      country: str(r.country) ?? "",
      countryCode: str(r.countryCode) ?? "",
      timezone: str(r.timezone) ?? "UTC",
      capacity: num(r.capacity),
      imageUrl: str(r.imageUrl),
      mapUrl: str(r.mapUrl),
      hostedMatchIds: [],
      localInfo: {
        nearestAirport: str(li.nearestAirport),
        publicTransport: str(li.publicTransport),
        parking: str(li.parking),
        attractions: str(li.attractions),
        food: str(li.food),
        hotels: str(li.hotels),
        safetyTips: str(li.safetyTips)
      },
      sourceMeta: meta
    };
    return [stadium];
  });
}
