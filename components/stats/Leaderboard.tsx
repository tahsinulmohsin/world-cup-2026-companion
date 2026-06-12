import EmptyState from "@/components/ui/EmptyState";

export default function Leaderboard({
  title,
  rows,
  unit
}: {
  title: string;
  rows: Array<{ label: string; sub?: string; value: number }>;
  unit?: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
      <h3 className="mb-3 font-display text-base font-bold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">Not available from official source yet.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.label} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-right font-display font-bold tabular-nums text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{r.label}</span>
                {r.sub && <span className="block truncate text-xs text-slate-500">{r.sub}</span>}
              </span>
              <span className="font-display font-bold tabular-nums">{r.value}{unit ?? ""}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function UnavailableStat({ title }: { title: string }) {
  return (
    <EmptyState title={title} message="This statistic appears once it is published by the official tournament source." icon="📊" />
  );
}
