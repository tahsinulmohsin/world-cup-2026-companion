import type { NewsItem } from "@/types";

const categoryLabel: Record<string, string> = {
  team_news: "Team news",
  injury_update: "Injury update",
  lineup_update: "Lineup update",
  match_preview: "Match preview",
  post_match_report: "Post-match report",
  tournament_update: "Tournament update",
  federation_update: "Federation update"
};

/** Summary-only card: headline + short excerpt, always linking out to the official article. */
export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl bg-white p-4 shadow-card transition hover:-translate-y-0.5 dark:bg-night-900 dark:shadow-card-dark"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-pitch-600 dark:text-pitch-400">
        {categoryLabel[item.category] ?? "Update"}
      </p>
      <h3 className="mt-1 font-display text-base font-bold leading-snug">{item.title}</h3>
      {item.summary && <p className="mt-1 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{item.summary}</p>}
      <p className="mt-2 text-[11px] text-slate-400">
        {item.sourceName} · {new Date(item.publishedAt).toLocaleDateString()} · Read at official source ↗
      </p>
    </a>
  );
}
