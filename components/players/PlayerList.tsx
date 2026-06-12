import PlayerCard from "./PlayerCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Player } from "@/types";

export default function PlayerList({ players, emptyMessage }: { players: Player[]; emptyMessage?: string }) {
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
      {players.map((p) => <PlayerCard key={p.id} player={p} />)}
    </div>
  );
}
