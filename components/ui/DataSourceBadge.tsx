import type { SourceMeta } from "@/types";
import { cn } from "@/utils/cn";

/** Source attribution, shown wherever fetched data is rendered. */
export default function DataSourceBadge({ meta, className }: { meta: SourceMeta; className?: string }) {
  const label =
    meta.reliability === "official"
      ? meta.sourceName
      : meta.reliability === "sample"
        ? "Sample data — official source not configured"
        : "Official source unavailable";
  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px]",
        meta.reliability === "official" && "text-slate-500 dark:text-slate-400",
        meta.reliability === "sample" && "text-amber-600 dark:text-amber-400",
        meta.reliability === "unavailable" && "text-rose-600 dark:text-rose-400",
        className
      )}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l2.5 2.5" />
      </svg>
      Source: {label}
    </span>
  );
  return meta.sourceUrl ? (
    <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {inner}
    </a>
  ) : (
    inner
  );
}
