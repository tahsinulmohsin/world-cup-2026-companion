"use client";

import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import MatchTime from "@/components/matches/MatchTime";
import { useReminders, notificationsSupported, requestNotificationPermission } from "@/hooks/useReminders";
import type { Fixture, ReminderType, Stadium } from "@/types";
import { useState } from "react";

const TYPE_LABELS: Record<ReminderType, string> = {
  before_30: "30 min before kickoff",
  kickoff: "Kickoff",
  goals: "Goals",
  half_time: "Half-time",
  full_time: "Full-time",
  lineup: "Lineup announcement",
  result: "Match result",
  highlights: "Highlights available"
};

export default function RemindersClient({
  fixtures,
  stadiums
}: {
  fixtures: Fixture[];
  stadiums: Record<string, Stadium | undefined>;
}) {
  const { reminders, removeReminder, addReminder, hydrated } = useReminders();
  const [permNote, setPermNote] = useState<string | null>(null);

  if (!hydrated) return null;

  async function enableNotifications() {
    const res = await requestNotificationPermission();
    if (res === "unsupported") setPermNote("This browser doesn't support notifications — reminders stay listed here.");
    else if (res === "denied") setPermNote("Permission denied. Enable notifications in browser settings to get alerts.");
    else setPermNote("Notifications enabled ✓ (alerts fire while the app is open, plus live updates as official status data arrives).");
  }

  if (reminders.length === 0) {
    return (
      <EmptyState
        title="No reminders yet"
        message='Tap "Notify me" on any match card to get an alert 30 minutes before kickoff. Goal, half-time, full-time, lineup and highlight alerts activate as official live status data is connected.'
        icon="🔔"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => void enableNotifications()} className="rounded-full bg-pitch-700 px-4 py-2 text-sm font-semibold text-white dark:bg-pitch-500 dark:text-night-950">
          {notificationsSupported() ? "Check notification permission" : "Notifications unsupported"}
        </button>
        {permNote && <p className="text-sm text-slate-500">{permNote}</p>}
      </div>
      <ul className="space-y-3">
        {reminders.map((r) => {
          const fixture = fixtures.find((f) => f.id === r.matchId);
          const stadium = fixture?.stadiumId ? stadiums[fixture.stadiumId] : undefined;
          return (
            <li key={r.matchId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
              <div className="min-w-0">
                {fixture ? (
                  <>
                    <Link href={`/matches/${fixture.id}`} className="font-semibold hover:underline">
                      {fixture.homeTeamName} vs {fixture.awayTeamName}
                    </Link>
                    <MatchTime isoUTC={fixture.dateTimeUTC} stadiumTimezone={stadium?.timezone} />
                  </>
                ) : (
                  <span className="font-semibold">Match {r.matchId}</span>
                )}
                <p className="mt-1 text-xs text-slate-500">{r.reminderTypes.map((t) => TYPE_LABELS[t]).join(" · ")}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(Object.keys(TYPE_LABELS) as ReminderType[]).map((type) => {
                    const on = r.reminderTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => fixture && addReminder(r.matchId, fixture.dateTimeUTC, on ? r.reminderTypes.filter((x) => x !== type) : [...r.reminderTypes, type])}
                        aria-pressed={on}
                        className={
                          "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset transition " +
                          (on ? "bg-pitch-600/10 text-pitch-700 ring-pitch-600/40 dark:text-pitch-300" : "text-slate-500 ring-slate-300 dark:ring-slate-700")
                        }
                      >
                        {TYPE_LABELS[type]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => removeReminder(r.matchId)} className="rounded-full px-3 py-1.5 text-sm font-medium text-rose-600 ring-1 ring-inset ring-rose-300 transition hover:bg-rose-50 dark:ring-rose-800 dark:hover:bg-rose-950/30">
                Remove
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-slate-400">
        Goal / half-time / full-time / lineup / highlight alerts depend on official live match status data and fire as that
        source updates. Kickoff alerts use official fixture times.
      </p>
    </div>
  );
}
