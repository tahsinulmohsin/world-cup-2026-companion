"use client";

import { useMemo, useState } from "react";
import MatchList from "@/components/matches/MatchList";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import TimezoneToggle from "@/components/layout/TimezoneToggle";
import { useFavorites } from "@/hooks/useFavorites";
import { useSpoilerFree } from "@/hooks/usePreferences";
import { useTranslation } from "@/hooks/useTranslation";
import { buildICS, downloadICS } from "@/utils/ics";
import type { Fixture, Stadium, Team } from "@/types";

export default function FixturesClient({
  fixtures,
  teams,
  stadiums
}: {
  fixtures: Fixture[];
  teams: Team[];
  stadiums: Stadium[];
}) {
  const [query, setQuery] = useState("");
  const [round, setRound] = useState("all");
  const [status, setStatus] = useState("all");
  const [team, setTeam] = useState("all");
  const [group, setGroup] = useState("all");
  const [stadiumId, setStadiumId] = useState("all");
  const [country, setCountry] = useState("all");
  const [scope, setScope] = useState("all");
  const { favorites } = useFavorites();
  const { spoilerFree, setSpoilerFree } = useSpoilerFree();
  const { t } = useTranslation();

  const stadiumMap = useMemo(() => Object.fromEntries(stadiums.map((s) => [s.id, s])), [stadiums]);
  const teamMap = useMemo(() => Object.fromEntries(teams.map((tm) => [tm.id, tm])), [teams]);
  const groups = useMemo(() => Array.from(new Set(fixtures.map((f) => f.group).filter(Boolean))).sort() as string[], [fixtures]);
  const countries = useMemo(() => Array.from(new Set(stadiums.map((s) => s.country))).sort(), [stadiums]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fixtures
      .filter((f) => {
        const st = f.stadiumId ? stadiumMap[f.stadiumId] : undefined;
        if (round !== "all" && f.round !== round) return false;
        if (status !== "all" && f.status !== status) return false;
        if (team !== "all" && f.homeTeamId !== team && f.awayTeamId !== team) return false;
        if (group !== "all" && f.group !== group) return false;
        if (stadiumId !== "all" && f.stadiumId !== stadiumId) return false;
        if (country !== "all" && st?.country !== country) return false;
        if (scope === "favorites" && !((f.homeTeamId && favorites.includes(f.homeTeamId)) || (f.awayTeamId && favorites.includes(f.awayTeamId)))) return false;
        if (scope === "knockout" && !f.isKnockout) return false;
        if (scope === "mustwatch" && !f.importanceLabel) return false;
        if (q) {
          const haystack = [f.homeTeamName, f.awayTeamName, f.round, st?.name, st?.city].filter(Boolean).join(" ").toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.dateTimeUTC.localeCompare(b.dateTimeUTC));
  }, [fixtures, query, round, status, team, group, stadiumId, country, scope, favorites, stadiumMap]);

  const select = "rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-night-900";

  function exportCalendar(list: Fixture[], name: string, file: string) {
    downloadICS(buildICS(list, stadiumMap, { calendarName: name }), file);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-night-900/50">
        <SearchBar value={query} onChange={setQuery} placeholder={t("common.search")} />
        <FilterBar
          active={scope}
          onSelect={setScope}
          options={[
            { id: "all", label: "All matches" },
            { id: "favorites", label: "★ Favorites only" },
            { id: "knockout", label: "Knockout only" },
            { id: "mustwatch", label: "Must-watch" }
          ]}
        />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <select aria-label="Round" className={select + " w-full sm:w-auto"} value={round} onChange={(e) => setRound(e.target.value)}>
            <option value="all">All rounds</option>
            {["Group Stage", "Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Third-place Match", "Final"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select aria-label="Team" className={select + " w-full sm:w-auto"} value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="all">All teams</option>
            {teams.map((tm) => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
          </select>
          <select aria-label="Group" className={select + " w-full sm:w-auto"} value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="all">All groups</option>
            {groups.map((g) => <option key={g} value={g}>Group {g}</option>)}
          </select>
          <select aria-label="Stadium" className={select + " col-span-2 w-full sm:w-auto"} value={stadiumId} onChange={(e) => setStadiumId(e.target.value)}>
            <option value="all">All stadiums</option>
            {stadiums.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select aria-label="Host country" className={select + " w-full sm:w-auto"} value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="all">All host countries</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select aria-label="Status" className={select + " w-full sm:w-auto"} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Any status</option>
            <option value="scheduled">Upcoming</option>
            <option value="live">Live</option>
            <option value="fulltime">Finished</option>
          </select>
          <div className="col-span-2 flex flex-wrap items-center gap-2">
            <TimezoneToggle />
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm">
              <input type="checkbox" checked={spoilerFree} onChange={(e) => setSpoilerFree(e.target.checked)} className="accent-pitch-600" />
              Spoiler-free
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:flex sm:flex-wrap">
          <button onClick={() => exportCalendar(fixtures, "World Cup 2026 — all matches", "wc26-all-matches.ics")} className="rounded-full px-3 py-1.5 font-medium ring-1 ring-inset ring-slate-300 hover:bg-white dark:ring-slate-700 dark:hover:bg-night-800">📅 All matches</button>
          <button
            onClick={() => exportCalendar(fixtures.filter((f) => (f.homeTeamId && favorites.includes(f.homeTeamId)) || (f.awayTeamId && favorites.includes(f.awayTeamId))), "World Cup 2026 — my teams", "wc26-my-teams.ics")}
            className="rounded-full px-3 py-1.5 font-medium ring-1 ring-inset ring-slate-300 hover:bg-white dark:ring-slate-700 dark:hover:bg-night-800"
          >★ My teams</button>
          <button onClick={() => exportCalendar(fixtures.filter((f) => f.isKnockout), "World Cup 2026 — knockout", "wc26-knockout.ics")} className="rounded-full px-3 py-1.5 font-medium ring-1 ring-inset ring-slate-300 hover:bg-white dark:ring-slate-700 dark:hover:bg-night-800">🏆 Knockout</button>
          <button
            onClick={() => exportCalendar(fixtures.filter((f) => f.importanceLabel === "Opening Match" || f.round === "Semi-final" || f.round === "Final"), "World Cup 2026 — showpiece matches", "wc26-showpiece.ics")}
            className="rounded-full px-3 py-1.5 font-medium ring-1 ring-inset ring-slate-300 hover:bg-white dark:ring-slate-700 dark:hover:bg-night-800"
          >✨ Key matches</button>
        </div>
      </div>

      <p className="text-sm text-slate-500">{filtered.length} match{filtered.length === 1 ? "" : "es"}</p>
      <MatchList fixtures={filtered} stadiums={stadiumMap} teams={teamMap} />
    </div>
  );
}
