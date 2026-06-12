import EmptyState from "@/components/ui/EmptyState";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import type { TimelineEvent } from "@/types";

const eventIcon: Record<string, string> = {
  goal: "⚽", own_goal: "🥅", penalty: "🎯", assist: "🅰️",
  yellow_card: "🟨", red_card: "🟥", substitution: "🔁",
  var_check: "🖥️", half_time: "⏸", full_time: "🏁",
  extra_time: "⏱", penalty_shootout: "🧤"
};

/** Reusable live timeline — events come only from the official match centre. */
export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No timeline yet"
        message="Live timeline events appear here from the official match centre once available."
        icon="🕒"
      />
    );
  }
  return (
    <ol className="relative space-y-3 border-l border-slate-200 pl-5 dark:border-slate-700">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs ring-1 ring-slate-200 dark:bg-night-900 dark:ring-slate-700" aria-hidden>
            {eventIcon[e.eventType] ?? "•"}
          </span>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-display font-bold tabular-nums">{e.minute}&prime;</span>
            <span>
              {e.playerName && <span className="font-semibold">{e.playerName} — </span>}
              {e.description || e.eventType.replace(/_/g, " ")}
            </span>
          </div>
        </li>
      ))}
      <li className="pt-1"><DataSourceBadge meta={events[0].sourceMeta} /></li>
    </ol>
  );
}
