"use client";

import { useState } from "react";
import { useReminders, notificationsSupported, requestNotificationPermission } from "@/hooks/useReminders";
import type { Fixture } from "@/types";
import { cn } from "@/utils/cn";

export default function ReminderButton({ fixture }: { fixture: Fixture }) {
  const { hasReminder, addReminder, removeReminder } = useReminders();
  const [note, setNote] = useState<string | null>(null);
  const active = hasReminder(fixture.id);

  async function toggle() {
    if (active) {
      removeReminder(fixture.id);
      return;
    }
    if (!notificationsSupported()) {
      setNote("Browser notifications aren't supported here — the reminder is saved to your Reminders list instead.");
    } else {
      const perm = await requestNotificationPermission();
      if (perm === "denied") {
        setNote("Notification permission was denied. The reminder is saved to your Reminders list instead.");
      }
    }
    addReminder(fixture.id, fixture.dateTimeUTC, ["before_30", "kickoff"]);
  }

  return (
    <div>
      <button
        onClick={toggle}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition",
          active
            ? "bg-pitch-600/10 text-pitch-700 ring-pitch-600/40 dark:text-pitch-300"
            : "text-slate-600 ring-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-night-800"
        )}
      >
        🔔 {active ? "Reminder set" : "Notify me"}
      </button>
      {note && <p className="mt-1 max-w-[16rem] text-[11px] text-amber-600 dark:text-amber-400">{note}</p>}
    </div>
  );
}
