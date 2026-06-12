import type { NewsCategory, NewsItem, SourceMeta } from "@/types";
import { asArray, str } from "./helpers";

const CATEGORIES: NewsCategory[] = [
  "team_news", "injury_update", "lineup_update", "match_preview",
  "post_match_report", "tournament_update", "federation_update"
];

function toCategory(v: unknown): NewsCategory {
  const s = (str(v) ?? "").toLowerCase();
  return (CATEGORIES as string[]).includes(s) ? (s as NewsCategory) : "tournament_update";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]+>/g, "").trim();
}

function firstTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return null;
  return decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
}

/** Accepts a JSON array/object OR an RSS/Atom XML string. Summaries only — never full articles. */
export function normalizeNews(raw: unknown, meta: SourceMeta): NewsItem[] {
  if (typeof raw === "string") {
    const items = raw.match(/<item[\s\S]*?<\/item>/gi) ?? raw.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
    return items.slice(0, 40).flatMap((block, i) => {
      const title = firstTag(block, "title");
      const link = firstTag(block, "link") ?? (block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? null);
      if (!title || !link) return [];
      const summaryRaw = firstTag(block, "description") ?? firstTag(block, "summary") ?? "";
      const item: NewsItem = {
        id: `rss-${i}-${link}`,
        title,
        category: "tournament_update",
        summary: summaryRaw.slice(0, 280),
        publishedAt: firstTag(block, "pubDate") ?? firstTag(block, "updated") ?? new Date().toISOString(),
        imageUrl: null,
        sourceName: meta.sourceName,
        sourceUrl: link
      };
      return [item];
    });
  }
  return asArray(raw).flatMap((entry) => {
    const r = entry as Record<string, unknown>;
    const title = str(r.title);
    const url = str(r.link) ?? str(r.url) ?? str(r.sourceUrl);
    if (!title || !url) return [];
    const item: NewsItem = {
      id: str(r.id) ?? url,
      title,
      category: toCategory(r.category),
      summary: (str(r.summary) ?? str(r.description) ?? "").slice(0, 280),
      publishedAt: str(r.publishedAt) ?? str(r.pubDate) ?? new Date().toISOString(),
      imageUrl: str(r.imageUrl),
      sourceName: str(r.sourceName) ?? meta.sourceName,
      sourceUrl: url
    };
    return [item];
  });
}
