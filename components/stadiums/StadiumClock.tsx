"use client";

import { useEffect, useState } from "react";

export default function StadiumClock({ timezone }: { timezone: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      try {
        setTime(new Intl.DateTimeFormat("en", { timeZone: timezone, hour: "2-digit", minute: "2-digit" }).format(new Date()));
      } catch {
        setTime("—");
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [timezone]);
  return <span className="tabular-nums">{time || "…"}</span>;
}
