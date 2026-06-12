import MatchCard from "./MatchCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Fixture, Stadium, Team } from "@/types";

export default function MatchList({
  fixtures,
  stadiums,
  teams,
  emptyTitle = "No matches found",
  emptyMessage = "Try a different filter, or check back once official fixture data is available."
}: {
  fixtures: Fixture[];
  stadiums: Record<string, Stadium | undefined>;
  teams: Record<string, Team | undefined>;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  if (fixtures.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {fixtures.map((f) => (
        <MatchCard key={f.id} fixture={f} stadium={f.stadiumId ? stadiums[f.stadiumId] : null} teams={teams} />
      ))}
    </div>
  );
}
