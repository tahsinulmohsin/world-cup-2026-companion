import { cn } from "@/utils/cn";

const styles: Record<string, string> = {
  live: "bg-live/10 text-live ring-live/30",
  upcoming: "bg-pitch-600/10 text-pitch-700 dark:text-pitch-300 ring-pitch-600/25",
  fulltime: "bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/25",
  halftime: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30",
  favorite: "bg-trophy-500/15 text-trophy-700 dark:text-trophy-300 ring-trophy-500/30",
  qualified: "bg-pitch-500/15 text-pitch-700 dark:text-pitch-300 ring-pitch-500/30",
  eliminated: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/25",
  neutral: "bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/20",
  gold: "bg-trophy-500/15 text-trophy-700 dark:text-trophy-300 ring-trophy-500/30"
};

export default function Badge({
  variant = "neutral",
  pulse = false,
  children,
  className
}: {
  variant?: keyof typeof styles;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        styles[variant],
        className
      )}
    >
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulseLive" aria-hidden />}
      {children}
    </span>
  );
}
