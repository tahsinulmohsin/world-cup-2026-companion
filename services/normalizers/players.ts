import type { Player, SourceMeta } from "@/types";
import { asArray, num, str } from "./helpers";

export function normalizePlayers(raw: unknown, meta: SourceMeta): Player[] {
  return asArray(raw).flatMap((item) => {
    const r = item as Record<string, unknown>;
    const id = str(r.id);
    const teamId = str(r.teamId);
    const name = str(r.name);
    if (!id || !teamId || !name) return [];
    const player: Player = {
      id,
      teamId,
      name,
      position: str(r.position),
      shirtNumber: num(r.shirtNumber),
      club: str(r.club),
      age: num(r.age),
      nationality: str(r.nationality),
      isKeyPlayer: r.isKeyPlayer === true,
      goals: num(r.goals),
      assists: num(r.assists),
      yellowCards: num(r.yellowCards),
      redCards: num(r.redCards),
      appearances: num(r.appearances),
      bio: str(r.bio),
      sourceMeta: meta
    };
    return [player];
  });
}
