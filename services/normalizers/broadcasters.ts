import type { Broadcaster, SourceMeta } from "@/types";
import { asArray, bool, str, strArr } from "./helpers";

export function normalizeBroadcasters(raw: unknown, meta: SourceMeta): Broadcaster[] {
  return asArray(raw).flatMap((item) => {
    const r = item as Record<string, unknown>;
    const countryCode = str(r.countryCode);
    if (!countryCode) return [];
    const b: Broadcaster = {
      countryCode: countryCode.toUpperCase(),
      countryName: str(r.countryName) ?? countryCode.toUpperCase(),
      tvChannels: strArr(r.tvChannels),
      streamingPlatforms: strArr(r.streamingPlatforms),
      notes: str(r.notes),
      languageOptions: strArr(r.languageOptions),
      isFree: bool(r.isFree),
      sourceMeta: meta
    };
    return [b];
  });
}
