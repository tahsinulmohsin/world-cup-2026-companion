import type { Standing, Team } from "@/types";

function Cell({ value }: { value: string | number | null }) {
  return <span className="text-sm">{value ?? <span className="text-slate-400">Not available from official source</span>}</span>;
}

function record(s: Standing | null): string | null {
  if (!s || s.played === 0) return null;
  return `${s.won}W ${s.drawn}D ${s.lost}L`;
}

function goals(s: Standing | null): string | null {
  if (!s || s.played === 0) return null;
  return `${s.goalsFor}–${s.goalsAgainst}`;
}

function diff(s: Standing | null): string | null {
  if (!s || s.played === 0) return null;
  return s.goalDifference > 0 ? `+${s.goalDifference}` : `${s.goalDifference}`;
}

function form(s: Standing | null, team: Team | null): string | null {
  const f = (s?.form.length ? s.form : team?.form) ?? [];
  return f.length ? f.join(" ") : null;
}

/**
 * Side-by-side comparison built only from sourced data: official group
 * standings (group, position, record, goals, form) with team metadata as a
 * fallback. Never invented — empty cells stay explicit when no data exists.
 */
export default function TeamComparisonPanel({
  home,
  away,
  homeStanding = null,
  awayStanding = null,
  homePosition = null,
  awayPosition = null
}: {
  home: Team | null;
  away: Team | null;
  homeStanding?: Standing | null;
  awayStanding?: Standing | null;
  homePosition?: number | null;
  awayPosition?: number | null;
}) {
  const rows: Array<{ label: string; h: string | number | null; a: string | number | null }> = [
    { label: "Group", h: homeStanding?.group ?? home?.group ?? null, a: awayStanding?.group ?? away?.group ?? null },
    { label: "Group position", h: homePosition, a: awayPosition },
    { label: "Played", h: homeStanding?.played ?? null, a: awayStanding?.played ?? null },
    { label: "Record (W-D-L)", h: record(homeStanding), a: record(awayStanding) },
    { label: "Goals (for–against)", h: goals(homeStanding), a: goals(awayStanding) },
    { label: "Goal difference", h: diff(homeStanding), a: diff(awayStanding) },
    { label: "Points", h: homeStanding && homeStanding.played > 0 ? homeStanding.points : null, a: awayStanding && awayStanding.played > 0 ? awayStanding.points : null },
    { label: "Recent form", h: form(homeStanding, home), a: form(awayStanding, away) },
    { label: "Official ranking", h: home?.ranking ?? null, a: away?.ranking ?? null },
    { label: "Best World Cup", h: home?.previousWorldCupPerformance ?? null, a: away?.previousWorldCupPerformance ?? null },
    { label: "Coach", h: home?.coach ?? null, a: away?.coach ?? null }
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
          <span className="text-center text-[11px] uppercase tracking-wide text-slate-500">{r.label}</span>
          <span className="text-right"><Cell value={r.a} /></span>
        </div>
      ))}
    </div>
  );
}
