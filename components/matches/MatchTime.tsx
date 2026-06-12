"use client";

import { useEffect, useState } from "react";
import { useTimezoneMode } from "@/hooks/usePreferences";
import { formatInTimezone, resolveTimezone } from "@/utils/time";
import { BD_TIMEZONE } from "@/utils/constants";

/**
 * Kickoff time in the user's chosen display timezone, with optional
 * secondary lines for Bangladesh and stadium-local time. Rendered
 * after mount to avoid server/client timezone hydration mismatches.
 */
export default function MatchTime({
  isoUTC,
  stadiumTimezone,
  showAll = false
}: {
  isoUTC: string;
  stadiumTimezone?: string | null;
  showAll?: boolean;
}) {
  const { mode } = useTimezoneMode();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="text-sm text-slate-500">{formatInTimezone(isoUTC, "UTC")} UTC</span>;
  }

  const { tz, label } = resolveTimezone(mode, stadiumTimezone);
  return (
    <div className="text-sm">
      <div className="font-medium">{formatInTimezone(isoUTC, tz)}</div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      {showAll && (
        <div className="mt-1 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          <div>🇧🇩 {formatInTimezone(isoUTC, BD_TIMEZONE)} (Bangladesh)</div>
          {stadiumTimezone && <div>🏟 {formatInTimezone(isoUTC, stadiumTimezone)} (stadium)</div>}
        </div>
      )}
    </div>
  );
}
