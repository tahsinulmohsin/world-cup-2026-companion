import type { SourceMeta, Team } from "@/types";
import { asArray, num, str, strArr } from "./helpers";

export function normalizeTeams(raw: unknown, meta: SourceMeta): Team[] {
  return asArray(raw).flatMap((item) => {
    const r = item as Record<string, unknown>;
    const id = str(r.id);
    const name = str(r.name);
    if (!id || !name) return [];
    const team: Team = {
      id,
      name,
      shortName: str(r.shortName) ?? name.slice(0, 3).toUpperCase(),
      flag: str(r.flag),
      group: str(r.group),
      coach: str(r.coach),
      ranking: num(r.ranking),
      previousWorldCupPerformance: str(r.previousWorldCupPerformance),
      form: strArr(r.form),
      sourceMeta: meta
    };
    return [team];
  });
}
