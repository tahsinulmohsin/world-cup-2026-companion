"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import TimezoneToggle from "@/components/layout/TimezoneToggle";
import TeamBadge from "@/components/teams/TeamBadge";
import FavoriteTeamButton from "@/components/teams/FavoriteTeamButton";
import { useSpoilerFree, useWatchCountry } from "@/hooks/usePreferences";
import { requestNotificationPermission, notificationsSupported } from "@/hooks/useReminders";
import { useTranslation } from "@/hooks/useTranslation";
import { WATCH_COUNTRIES, STORAGE_KEYS } from "@/utils/constants";
import type { Team } from "@/types";

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
      <div>
        <p className="font-semibold">{title}</p>
        {desc && <p className="text-sm text-slate-500">{desc}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsClient({ teams }: { teams: Team[] }) {
  const { spoilerFree, setSpoilerFree, favoritesOnly, setFavoritesOnly } = useSpoilerFree();
  const { country, setCountry } = useWatchCountry();
  const { t } = useTranslation();
  const [notifStatus, setNotifStatus] = useState<string | null>(null);
  const [installed, setInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  function resetAll() {
    if (!confirm("Reset all app preferences (favorites, reminders, predictions, settings)?")) return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    location.reload();
  }

  return (
    <div className="space-y-3">
      <Row title={t("settings.theme")} desc="System, dark or light"><ThemeToggle /></Row>
      <Row title={t("settings.language")} desc="English & বাংলা today; Español, Français, العربية structured for translation"><LanguageSwitcher /></Row>
      <Row title={t("settings.timezone")} desc="Match times across the app, including the Bangladesh time toggle"><TimezoneToggle /></Row>
      <Row title={t("settings.spoilerFree")} desc="Hide scores, results, timelines and highlights until revealed">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={spoilerFree} onChange={(e) => setSpoilerFree(e.target.checked)} className="h-4 w-4 accent-pitch-600" />
          {spoilerFree ? "On" : "Off"}
        </label>
      </Row>
      {spoilerFree && (
        <Row title="Hide favorite team scores only" desc="Keep other results visible">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} className="h-4 w-4 accent-pitch-600" />
            {favoritesOnly ? "On" : "Off"}
          </label>
        </Row>
      )}
      <Row title="Notifications" desc="Permission for match reminders">
        <button
          onClick={async () => {
            const res = await requestNotificationPermission();
            setNotifStatus(res === "unsupported" ? "Not supported in this browser" : `Permission: ${res}`);
          }}
          className="rounded-full bg-pitch-700 px-4 py-2 text-sm font-semibold text-white dark:bg-pitch-500 dark:text-night-950"
        >
          {notificationsSupported() ? "Request permission" : "Unsupported"}
        </button>
        {notifStatus && <p className="mt-1 text-xs text-slate-500">{notifStatus}</p>}
      </Row>
      <Row title="Where-to-watch country" desc="Default country for broadcaster lookups">
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-night-950">
          <option value="">Not set</option>
          {WATCH_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </Row>
      <Row title="PWA install" desc={installed ? "Running as an installed app ✓" : "Use your browser's install option, or the in-app prompt when offered"}>
        <span className="text-sm font-medium">{installed ? "Installed" : "Browser"}</span>
      </Row>

      <div className="rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
        <p className="font-semibold">Favorite teams</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {teams.map((tm) => (
            <div key={tm.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-night-800/60">
              <span className="flex min-w-0 items-center gap-2"><TeamBadge name={tm.name} flag={tm.flag} size="sm" /><span className="truncate text-sm font-medium">{tm.name}</span></span>
              <FavoriteTeamButton teamId={tm.id} compact />
            </div>
          ))}
        </div>
      </div>

      <Row title={t("settings.reset")} desc="Clears favorites, reminders, predictions, reactions and preferences">
        <button onClick={resetAll} className="rounded-full px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-inset ring-rose-300 transition hover:bg-rose-50 dark:ring-rose-800 dark:hover:bg-rose-950/30">
          Reset everything
        </button>
      </Row>
    </div>
  );
}
