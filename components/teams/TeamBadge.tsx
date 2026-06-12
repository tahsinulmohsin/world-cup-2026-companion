import { cn } from "@/utils/cn";

/** Flag emoji or a neutral crest placeholder — never unlicensed assets. */
export default function TeamBadge({
  name,
  flag,
  size = "md"
}: {
  name: string;
  flag?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-6 w-6 text-sm", md: "h-8 w-8 text-lg", lg: "h-12 w-12 text-2xl" };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200 dark:bg-night-800 dark:ring-night-800",
        sizes[size]
      )}
      aria-hidden
    >
      {flag ?? <span className="text-[0.6em] font-bold text-slate-500">{name.slice(0, 3).toUpperCase()}</span>}
    </span>
  );
}
