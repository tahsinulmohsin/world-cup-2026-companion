import type { QualificationStatus, SourceMeta, Standing } from "@/types";
import { asArray, num, str, strArr } from "./helpers";

function toQual(v: unknown): QualificationStatus {
  const s = (str(v) ?? "").toLowerCase();
  if (s === "qualified") return "qualified";
  if (s === "eliminated") return "eliminated";
  if (s === "in_contention" || s === "contention") return "in_contention";
  return "unknown";
}

export function normalizeStandings(raw: unknown, meta: SourceMeta): Standing[] {
  return asArray(raw).flatMap((item) => {
    const r = item as Record<string, unknown>;
    const group = str(r.group);
    const teamId = str(r.teamId);
    if (!group || !teamId) return [];
    const gf = num(r.goalsFor) ?? 0;
    const ga = num(r.goalsAgainst) ?? 0;
    const standing: Standing = {
      group,
      teamId,
      teamName: str(r.team) ?? str(r.teamName) ?? teamId.toUpperCase(),
      played: num(r.played) ?? 0,
      won: num(r.won) ?? 0,
      drawn: num(r.drawn) ?? 0,
      lost: num(r.lost) ?? 0,
      goalsFor: gf,
      goalsAgainst: ga,
      goalDifference: num(r.goalDifference) ?? gf - ga,
      points: num(r.points) ?? 0,
      form: strArr(r.form),
      qualificationStatus: toQual(r.qualificationStatus),
      sourceMeta: meta
    };
    return [standing];
  });
}

/** FIFA-style tiebreakers: points → goal difference → goals scored → name. */
export function sortGroup(rows: Standing[]): Standing[] {
  return [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.teamName.localeCompare(b.teamName)
  );
}
