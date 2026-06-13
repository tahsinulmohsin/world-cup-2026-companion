import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { Player, Team } from "@/types";

export default function PlayerCard({ player, team }: { player: Player; team?: Team }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card transition hover:-translate-y-0.5 dark:bg-night-900 dark:shadow-card-dark"
    >
      {player.imageUrl ? (
        <img
          src={player.imageUrl}
          alt={player.name}
          className="h-10 w-10 shrink-0 rounded-full object-cover bg-slate-100 dark:bg-slate-800"
        />
      ) : (
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random`}
          alt={player.name}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 truncate font-semibold">
          {team?.flag && <span title={team.name}>{team.flag}</span>}
          {player.name}
        </span>
        <span className="block text-xs text-slate-500 truncate">{player.position ?? "—"}{player.club ? ` · ${player.club}` : ""}</span>
      </span>
      {player.isKeyPlayer && <Badge variant="gold" className="ml-auto">Key</Badge>}
    </Link>
  );
}
