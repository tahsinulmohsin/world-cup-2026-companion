import NewsCard from "@/components/news/NewsCard";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { getNews } from "@/services/sync/syncService";

export const metadata = { title: "News" };
export const revalidate = 900;

export default async function NewsPage() {
  const res = await getNews();
  const news = res.data ?? [];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Official News</h1>
          <p className="text-sm text-slate-500">Summaries only — every story links to the original official article.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={res.meta} />
          <LastUpdatedBadge iso={res.meta.fetchedAt} />
        </div>
      </header>
      {res.error && <ErrorState message={res.error} />}
      {news.length === 0 ? (
        <EmptyState
          title="News feed not configured"
          message="Set OFFICIAL_NEWS_RSS_URL to an official FIFA or federation RSS/JSON feed to show tournament headlines here. We never display unofficial or invented news."
          icon="📰"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => <NewsCard key={n.id} item={n} />)}
        </div>
      )}
    </div>
  );
}
