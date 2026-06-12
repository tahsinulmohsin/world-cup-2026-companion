"use client";

import { useEffect, useState } from "react";
import { TOURNAMENT_START_UTC, TOURNAMENT_END_UTC } from "@/utils/constants";
import { useTranslation } from "@/hooks/useTranslation";

export default function Countdown() {
  const { t } = useTranslation();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const start = new Date(TOURNAMENT_START_UTC).getTime();
  const end = new Date(TOURNAMENT_END_UTC).getTime();

  if (now >= start && now <= end) {
    return (
      <p className="font-display text-lg font-bold text-pitch-100">
        <span className="mr-2 inline-block h-2.5 w-2.5 animate-pulseLive rounded-full bg-live align-middle" aria-hidden />
        The tournament is underway
      </p>
    );
  }
  if (now > end) {
    return <p className="font-display text-lg font-bold text-pitch-100">The 2026 tournament has finished — thanks for following along!</p>;
  }

  const diff = start - now;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-pitch-200">{t("home.countdown")}</p>
      <div className="mt-1 flex gap-4 font-display text-3xl font-extrabold tabular-nums text-white sm:text-4xl">
        {[{ v: d, l: "days" }, { v: h, l: "hrs" }, { v: m, l: "min" }, { v: s, l: "sec" }].map((u) => (
          <span key={u.l}>
            {u.v}<span className="ml-1 text-sm font-medium text-pitch-200">{u.l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
