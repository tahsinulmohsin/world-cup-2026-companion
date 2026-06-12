"use client";

import { useMemo, useState } from "react";
import MatchList from "@/components/matches/MatchList";
import FilterBar from "@/components/ui/FilterBar";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "@/hooks/useTranslation";
import { getUserTimezone, isToday, isTomorrow } from "@/utils/time";
import type { Fixture, Stadium, Team } from "@/types";

export default function HomeMatches({
  fixtures,
  teams,
  stadiums
}: {
  fixtures: Fixture[];
  teams: Team[];
  stadiums: Record<string, Stadium | undefined>;
}) {
  const [filter, setFilter] = useState("today");
  const { favorites } = useFavorites();
  const { t } = useTranslation();
  const teamMap = useMemo(() => Object.fromEntries(teams.map((tm) => [tm.id, tm])), [teams]);

  const live = fixtures.filter((f) => f.status === "live" || f.status === "halftime");

  const filtered = useMemo(() => {
    const tz = getUserTimezone();
    let list = fixtures.filter((f) => f.status !== "fulltime");
    switch (filter) {
      case "today": list = list.filter((f) => isToday(f.dateTimeUTC, tz)); break;
      case "tomorrow": list = list.filter((f) => isTomorrow(f.dateTimeUTC, tz)); break;
      case "group": list = list.filter((f) => !f.isKnockout); break;
      case "knockout": list = list.filter((f) => f.isKnockout); break;
      case "favorites":
        list = list.filter(
          (f) => (f.homeTeamId && favorites.includes(f.homeTeamId)) || (f.awayTeamId && favorites.includes(f.awayTeamId))
        );
        break;
    }
    return list.sort((a, b) => a.dateTimeUTC.localeCompare(b.dateTimeUTC)).slice(0, 6);
  }, [fixtures, filter, favorites]);

  return (
    <div className="space-y-8">
      {live.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">{t("home.liveNow")}</h2>
          <MatchList fixtures={live} stadiums={stadiums} teams={teamMap} />
        </section>
      )}
      <section>
        <h2 className="mb-3 font-display text-xl font-bold">{t("home.upcomingMatches")}</h2>
        <FilterBar
          className="mb-4"
          active={filter}
          onSelect={setFilter}
          options={[
            { id: "today", label: t("common.today") },
            { id: "tomorrow", label: t("common.tomorrow") },
            { id: "group", label: "Group Stage" },
            { id: "knockout", label: "Knockout" },
            { id: "favorites", label: "★ My teams" }
          ]}
        />
        <MatchList
          fixtures={filtered}
          stadiums={stadiums}
          teams={teamMap}
          emptyTitle="No matches for this filter"
          emptyMessage="Try another filter — fixtures update automatically from the official schedule."
        />
      </section>
    </div>
  );
}
