import { createOfficialSource } from "./baseSource";
import { normalizeNews } from "@/services/normalizers/news";
import type { NewsItem } from "@/types";

export const officialNewsSource = createOfficialSource<NewsItem[]>({
  id: "official-news",
  name: "Official Tournament & Federation News",
  envUrlKey: "OFFICIAL_NEWS_RSS_URL",
  ttlMs: 30 * 60 * 1000,
  validate: (raw) => typeof raw === "string" || Array.isArray(raw) || (typeof raw === "object" && raw !== null),
  normalize: (raw, meta) => normalizeNews(raw, meta),
  fallback: () => null, // never show fabricated news
  count: (d) => d.length,
  licenseNote: "Headlines and short summaries only, always linking to the original official article."
});
