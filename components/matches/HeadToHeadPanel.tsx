import EmptyState from "@/components/ui/EmptyState";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import type { HeadToHead } from "@/types";

export default function HeadToHeadPanel({ h2h }: { h2h: HeadToHead | null }) {
  if (!h2h) {
    return (
      <EmptyState
        title="Head-to-head unavailable"
        message="Previous meetings appear here once verified official head-to-head data is available for this pairing."
        icon="🤝"
      />
    );
  }
  return (
    <div className="space-y-4 text-sm">
      {h2h.allTimeRecord && (
        <p>
          <span className="font-semibold">All-time:</span> {h2h.allTimeRecord.homeWins} wins · {h2h.allTimeRecord.draws} draws · {h2h.allTimeRecord.awayWins} losses
        </p>
      )}
      {h2h.biggestWin && <p><span className="font-semibold">Biggest win:</span> {h2h.biggestWin}</p>}
      {h2h.goalsInPreviousMeetings !== null && (
        <p><span className="font-semibold">Goals in previous meetings:</span> {h2h.goalsInPreviousMeetings}</p>
      )}
      {h2h.lastMeetings.length > 0 && (
        <div>
          <p className="font-semibold">Last meetings</p>
          <ul className="mt-1 space-y-1 text-slate-600 dark:text-slate-300">
            {h2h.lastMeetings.slice(0, 5).map((m, i) => (
              <li key={i}>{m.date} · {m.competition} · {m.score}</li>
            ))}
          </ul>
        </div>
      )}
      {h2h.worldCupMeetings.length > 0 && (
        <div>
          <p className="font-semibold">World Cup meetings</p>
          <ul className="mt-1 space-y-1 text-slate-600 dark:text-slate-300">
            {h2h.worldCupMeetings.map((m, i) => (
              <li key={i}>{m.date} · {m.score}</li>
            ))}
          </ul>
        </div>
      )}
      {h2h.rivalryFact && <p className="italic text-slate-500">{h2h.rivalryFact}</p>}
      <DataSourceBadge meta={h2h.sourceMeta} />
    </div>
  );
}
