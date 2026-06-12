"use client";

import { buildICS, downloadICS, googleCalendarUrl } from "@/utils/ics";
import { useState } from "react";
import type { Fixture, Stadium } from "@/types";

export default function CalendarButton({ fixture, stadium }: { fixture: Fixture; stadium?: Stadium | null }) {
  const [open, setOpen] = useState(false);
  const stadiumLabel = stadium ? `${stadium.name}, ${stadium.city}` : undefined;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-night-800"
        aria-expanded={open}
      >
        📅 Calendar
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-card dark:border-slate-700 dark:bg-night-900">
          <button
            className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-night-800"
            onClick={() => {
              downloadICS(
                buildICS([fixture], stadium ? { [stadium.id]: stadium } : {}),
                `wc26-${fixture.id}.ics`
              );
              setOpen(false);
            }}
          >
            Download .ics file
          </button>
          <a
            className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-night-800"
            href={googleCalendarUrl(fixture, stadiumLabel)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Add to Google Calendar
          </a>
        </div>
      )}
    </div>
  );
}
