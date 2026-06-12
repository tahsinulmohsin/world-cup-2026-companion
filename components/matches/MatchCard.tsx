"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "@/components/ui/Badge";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import TeamBadge from "@/components/teams/TeamBadge";
import MatchImportanceBadge from "./MatchImportanceBadge";
import SpoilerScore from "./SpoilerScore";
import MatchTime from "./MatchTime";
import CalendarButton from "./CalendarButton";
import ReminderButton from "./ReminderButton";
import PredictionPoll from "./PredictionPoll";
import WatchOptionsModal from "./WatchOptionsModal";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "@/hooks/useTranslation";
import type { Fixture, Stadium, Team } from "@/types";
import { cn } from "@/utils/cn";

const statusBadge: Record<string, { variant: "live" | "upcoming" | "fulltime" | "halftime" | "neutral"; key: string }> = {
  live: { variant: "live", key: "common.live" },
  halftime: { variant: "halftime", key: "common.halfTime" },
  fulltime: { variant: "fulltime", key: "common.fullTime" },
  scheduled: { variant: "upcoming", key: "common.upcoming" },
  postponed: { variant: "neutral", key: "common.upcoming" },
  unknown: { variant: "neutral", key: "common.upcoming" }
};

/**
 * Signature "match ticket" card: perforated stub edge, all key match
 * info, and the full action row (watch / notify / calendar / predict).
 */
export default function MatchCard({
  fixture,
  stadium,
  teams
}: {
  fixture: Fixture;
  stadium?: Stadium | null;
  teams?: Record<string, Team | undefined>;
}) {
  const { isFavorite } = useFavorites();
  const { t } = useTranslation();
  const [watchOpen, setWatchOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);

  const home = fixture.homeTeamId ? teams?.[fixture.homeTeamId] : undefined;
  const away = fixture.awayTeamId ? teams?.[fixture.awayTeamId] : undefined;
  const involvesFavorite = isFavorite(fixture.homeTeamId) || isFavorite(fixture.awayTeamId);
  const sb = statusBadge[fixture.status] ?? statusBadge.unknown;

  return (
    <article
      className={cn(
        "ticket-card relative rounded-2xl bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-night-900 dark:shadow-card-dark",
        involvesFavorite && "ring-2 ring-trophy-500/50"
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={sb.variant} pulse={fixture.status === "live"}>
            {t(sb.key)}
            {fixture.status === "live" && fixture.minute !== null ? ` ${fixture.minute}'` : ""}
          </Badge>
          <MatchImportanceBadge label={fixture.importanceLabel} />
          {fixture.group && <Badge variant="neutral">Group {fixture.group}</Badge>}
          {fixture.isKnockout && <Badge variant="neutral">{fixture.round}</Badge>}
          {involvesFavorite && <Badge variant="favorite">★ {t("common.favorite")}</Badge>}
        </div>

        <Link href={`/matches/${fixture.id}`} className="mt-3 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-pitch-500 rounded-lg">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <TeamBadge name={fixture.homeTeamName} flag={home?.flag} />
              <span className="truncate font-semibold">{fixture.homeTeamName}</span>
            </div>
            <SpoilerScore fixture={fixture} />
            <div className="flex items-center justify-end gap-2 overflow-hidden text-right">
              <span className="truncate font-semibold">{fixture.awayTeamName}</span>
              <TeamBadge name={fixture.awayTeamName} flag={away?.flag} />
            </div>
          </div>
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <MatchTime isoUTC={fixture.dateTimeUTC} stadiumTimezone={stadium?.timezone} showAll />
          <div className="text-right text-sm">
            <div className="font-medium">{stadium?.name ?? "Venue TBC"}</div>
            {stadium && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {stadium.city}, {stadium.country}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ticket-divider" aria-hidden />

      <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
        <button
          onClick={() => setWatchOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-pitch-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-pitch-800 dark:bg-pitch-500 dark:text-night-950 dark:hover:bg-pitch-400"
        >
          📺 {t("actions.whereToWatch")}
        </button>
        <ReminderButton fixture={fixture} />
        <CalendarButton fixture={fixture} stadium={stadium} />
        <button
          onClick={() => setPollOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-night-800"
          aria-expanded={pollOpen}
        >
          📊 {t("actions.predict")}
        </button>
      </div>

      {pollOpen && (
        <div className="px-4 pb-4 sm:px-5">
          <PredictionPoll fixture={fixture} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pb-3 sm:px-5">
        <DataSourceBadge meta={fixture.sourceMeta} />
        <LastUpdatedBadge iso={fixture.sourceMeta.fetchedAt} />
      </div>

      <WatchOptionsModal open={watchOpen} onClose={() => setWatchOpen(false)} />
    </article>
  );
}
