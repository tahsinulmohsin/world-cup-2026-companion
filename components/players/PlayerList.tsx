import PlayerCard from "./PlayerCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Player, Team } from "@/types";

export default function PlayerList({ players, teams, emptyMessage }: { players: Player[]; teams?: Team[]; emptyMessage?: string }) {
  if (players.length === 0) {
    return (
      <EmptyState
        title="Squad not announced"
        message={emptyMessage ?? "Player lists appear here from official FIFA / federation squad announcements."}
        icon="👥"
      />
    );
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {players.map((p) => <PlayerCard key={p.id} player={p} team={teams?.find(t => t.id === p.teamId)} />)}
    </div>
  );
}
