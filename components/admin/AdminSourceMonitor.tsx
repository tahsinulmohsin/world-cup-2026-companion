"use client";

import { useState } from "react";
import type { SourceStatus } from "@/types";
import { cn } from "@/utils/cn";

interface StatusResponse {
  statuses: SourceStatus[];
  errors: Array<{ at: string; sourceId: string; message: string }>;
}

export default function AdminSourceMonitor() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(pw: string) {
    setError(null);
    const res = await fetch("/api/admin/status", { headers: { "x-admin-password": pw } });
    if (res.status === 401) {
      setError("Wrong password, or ADMIN_PASSWORD is not set on the server.");
      setData(null);
      return;
    }
    setData((await res.json()) as StatusResponse);
  }

  async function refresh(scope: string) {
    setBusy(scope);
    await fetch("/api/admin/refresh", {
      method: "POST",
      headers: { "x-admin-password": password, "content-type": "application/json" },
      body: JSON.stringify({ scope })
    });
    await load(password);
    setBusy(null);
  }

  if (!data) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(password);
        }}
        className="mx-auto max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-card dark:bg-night-900 dark:shadow-card-dark"
      >
        <h2 className="font-display text-lg font-bold">Admin access</h2>
        <p className="text-sm text-slate-500">
          This panel monitors official data sources and cache health. It never edits tournament data manually.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-night-950"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="w-full rounded-xl bg-pitch-700 py-2 text-sm font-semibold text-white dark:bg-pitch-500 dark:text-night-950">
          Open monitor
        </button>
      </form>
    );
  }

  const scopeFor: Record<string, string> = {
    "fifa-fixtures": "fixtures", "fifa-standings": "standings", "fifa-match-centre": "matchCentre",
    "fifa-teams": "teams", "federation-squads": "squads", "official-broadcasters": "broadcasters",
    "official-stadiums": "stadiums", "official-news": "news", "official-tickets": "tickets",
    "official-travel": "travel", "official-watch-parties": "watchParties"
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl bg-white shadow-card dark:bg-night-900 dark:shadow-card-dark">
        <table className="w-full min-w-[44rem] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:border-night-800">
              <th className="px-4 py-2.5">Source</th>
              <th className="py-2.5">Configured</th>
              <th className="py-2.5">Cache</th>
              <th className="py-2.5">Items</th>
              <th className="py-2.5">Last fetch</th>
              <th className="py-2.5">Last error</th>
              <th className="py-2.5 pr-4" />
            </tr>
          </thead>
          <tbody>
            {data.statuses.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 dark:border-night-800/60">
                <td className="px-4 py-2.5 font-medium">{s.name}</td>
                <td className="py-2.5">
                  <span className={cn("font-semibold", s.configured ? "text-pitch-600" : "text-amber-600")}>
                    {s.configured ? "Yes" : `No (${s.envKey})`}
                  </span>
                </td>
                <td className="py-2.5">{s.cacheState}</td>
                <td className="py-2.5 tabular-nums">{s.itemCount ?? "—"}</td>
                <td className="py-2.5 text-xs">{s.lastFetchAt ? new Date(s.lastFetchAt).toLocaleTimeString() : "—"}</td>
                <td className="max-w-[14rem] truncate py-2.5 text-xs text-rose-600" title={s.lastError ?? ""}>{s.lastError ?? "—"}</td>
                <td className="py-2.5 pr-4">
                  <button
                    onClick={() => void refresh(scopeFor[s.id] ?? s.id)}
                    disabled={busy !== null}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold transition hover:bg-slate-200 disabled:opacity-50 dark:bg-night-800"
                  >
                    {busy === (scopeFor[s.id] ?? s.id) ? "…" : "Refresh"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h3 className="mb-2 font-display text-base font-bold">Fetch error log</h3>
        {data.errors.length === 0 ? (
          <p className="text-sm text-slate-500">No source errors recorded on this server instance.</p>
        ) : (
          <ul className="space-y-1 rounded-2xl bg-white p-4 text-xs shadow-card dark:bg-night-900 dark:shadow-card-dark">
            {data.errors.map((e, i) => (
              <li key={i} className="font-mono">
                <span className="text-slate-400">{new Date(e.at).toLocaleTimeString()}</span>{" "}
                <span className="font-semibold">{e.sourceId}</span> — {e.message}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
