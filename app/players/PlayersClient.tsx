"use client";

import { useMemo, useState } from "react";
import PlayerList from "@/components/players/PlayerList";
import SearchBar from "@/components/ui/SearchBar";
import type { Player, Team } from "@/types";

export default function PlayersClient({ players, teams }: { players: Player[]; teams: Team[] }) {
  const [query, setQuery] = useState("");
  const [teamId, setTeamId] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter((p) => {
      if (teamId !== "all" && p.teamId !== teamId) return false;
      if (q && !`${p.name} ${p.club ?? ""} ${p.position ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [players, query, teamId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1"><SearchBar value={query} onChange={setQuery} placeholder="Search players, clubs, positions…" /></div>
        <select
          aria-label="Team"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-night-900"
        >
          <option value="all">All teams</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.flag ? t.flag + " " : ""}{t.name}</option>)}
        </select>
      </div>
      <PlayerList players={filtered} teams={teams} emptyMessage="No players match this filter, or squads haven't been announced by official sources yet." />
    </div>
  );
}
