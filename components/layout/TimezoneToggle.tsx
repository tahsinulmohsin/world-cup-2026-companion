"use client";

import { useTimezoneMode } from "@/hooks/usePreferences";
import { useTranslation } from "@/hooks/useTranslation";
import type { TimezoneMode } from "@/utils/constants";

const MODES: Array<{ id: TimezoneMode; key: string }> = [
  { id: "local", key: "tz.local" },
  { id: "bangladesh", key: "tz.bangladesh" },
  { id: "stadium", key: "tz.stadium" },
  { id: "host", key: "tz.host" }
];

export default function TimezoneToggle() {
  const { mode, setMode } = useTimezoneMode();
  const { t } = useTranslation();
  return (
    <label className="inline-flex items-center gap-1.5 text-sm">
      <span aria-hidden>🕒</span>
      <span className="sr-only">Time display</span>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as TimezoneMode)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-night-900"
      >
        {MODES.map((m) => (
          <option key={m.id} value={m.id}>{t(m.key)}</option>
        ))}
      </select>
    </label>
  );
}
