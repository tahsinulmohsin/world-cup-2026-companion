import type { Team } from "@/types";

function Cell({ value }: { value: string | number | null }) {
  return <span className="text-sm">{value ?? <span className="text-slate-400">Not available from official source</span>}</span>;
}

/** Side-by-side comparison built only from sourced team data — never invented. */
export default function TeamComparisonPanel({ home, away }: { home: Team | null; away: Team | null }) {
  const rows: Array<{ label: string; h: string | number | null; a: string | number | null }> = [
    { label: "Official ranking", h: home?.ranking ?? null, a: away?.ranking ?? null },
    { label: "Recent form", h: home?.form.join(" ") || null, a: away?.form.join(" ") || null },
    { label: "Best World Cup", h: home?.previousWorldCupPerformance ?? null, a: away?.previousWorldCupPerformance ?? null },
    { label: "Coach", h: home?.coach ?? null, a: away?.coach ?? null },
    { label: "Win probability", h: null, a: null },
    { label: "Strengths & weaknesses", h: null, a: null }
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-[1fr_auto_1fr] bg-slate-50 px-4 py-2 text-sm font-semibold dark:bg-night-800">
        <span className="truncate">{home?.name ?? "TBD"}</span>
        <span />
        <span className="truncate text-right">{away?.name ?? "TBD"}</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-slate-100 px-4 py-2.5 dark:border-night-800">
          <Cell value={r.h} />
          <span className="text-[11px] uppercase tracking-wide text-slate-500">{r.label}</span>
          <span className="text-right"><Cell value={r.a} /></span>
        </div>
      ))}
    </div>
  );
}
