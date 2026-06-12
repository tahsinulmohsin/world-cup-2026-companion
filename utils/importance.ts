import type { Fixture, Standing } from "@/types";

/**
 * Match importance is derived from official fixture context (round,
 * match number) and official standings — never manually guessed.
 */
export function computeImportance(fixtures: Fixture[], standings: Standing[]): Fixture[] {
  const firstKickoff = fixtures.reduce<string | null>(
    (min, f) => (min === null || f.dateTimeUTC < min ? f.dateTimeUTC : min),
    null
  );

  return fixtures.map((f) => {
    let label: string | null = null;
    if (f.round === "Final") label = "Final";
    else if (f.round === "Semi-final") label = "Semi-final";
    else if (f.round === "Third-place Match") label = "Third-place Match";
    else if (f.isKnockout) label = "Knockout Match";
    else if (f.matchNumber === 1 || f.dateTimeUTC === firstKickoff) label = "Opening Match";
    else if (f.group) {
      const home = standings.find((s) => s.teamId === f.homeTeamId);
      const away = standings.find((s) => s.teamId === f.awayTeamId);
      const decider =
        (home?.played === 2 || away?.played === 2) &&
        (home?.qualificationStatus === "in_contention" || away?.qualificationStatus === "in_contention");
      if (decider) label = "Qualification Decider";
    }
    return { ...f, importanceLabel: label };
  });
}
