import EmptyState from "@/components/ui/EmptyState";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import type { LiveStats } from "@/types";

function StatRow({ label, home, away, pct = false }: { label: string; home: number | null; away: number | null; pct?: boolean }) {
  if (home === null && away === null) return null; // hide stats not provided by the official source
  const h = home ?? 0;
  const a = away ?? 0;
  const total = h + a || 1;
  return (
    <div>
      <div className="flex justify-between text-sm tabular-nums">
        <span className="font-semibold">{home ?? "—"}{pct && home !== null ? "%" : ""}</span>
        <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
        <span className="font-semibold">{away ?? "—"}{pct && away !== null ? "%" : ""}</span>
      </div>
      <div className="mt-1 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-night-800" aria-hidden>
        <span className="bg-pitch-600 transition-all" style={{ width: `${(h / total) * 100}%` }} />
        <span className="bg-trophy-500 transition-all" style={{ width: `${(a / total) * 100}%` }} />
      </div>
    </div>
  );
}

export default function LiveStatsPanel({ stats }: { stats: LiveStats | null }) {
  if (!stats) {
    return (
      <EmptyState
        title="Live stats unavailable"
        message="Match statistics appear here from official match data once available."
        icon="📈"
      />
    );
  }
  return (
    <div className="space-y-4">
      <StatRow label="Possession" home={stats.possessionHome} away={stats.possessionAway} pct />
      <StatRow label="Shots" home={stats.shotsHome} away={stats.shotsAway} />
      <StatRow label="On target" home={stats.shotsOnTargetHome} away={stats.shotsOnTargetAway} />
      <StatRow label="Corners" home={stats.cornersHome} away={stats.cornersAway} />
      <StatRow label="Fouls" home={stats.foulsHome} away={stats.foulsAway} />
      <StatRow label="Yellow cards" home={stats.yellowsHome} away={stats.yellowsAway} />
      <StatRow label="Red cards" home={stats.redsHome} away={stats.redsAway} />
      <StatRow label="Offsides" home={stats.offsidesHome} away={stats.offsidesAway} />
      <StatRow label="Pass accuracy" home={stats.passAccuracyHome} away={stats.passAccuracyAway} pct />
      <StatRow label="Expected goals" home={stats.xgHome} away={stats.xgAway} />
      <DataSourceBadge meta={stats.sourceMeta} />
    </div>
  );
}
