"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/utils/time";

export default function LastUpdatedBadge({ iso }: { iso: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    setLabel(relativeTime(iso));
    const id = setInterval(() => setLabel(relativeTime(iso)), 30_000);
    return () => clearInterval(id);
  }, [iso]);
  if (!label) return null;
  return <span className="text-[11px] text-slate-400 dark:text-slate-500">Updated {label}</span>;
}
