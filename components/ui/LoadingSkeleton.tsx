import { cn } from "@/utils/cn";

export default function LoadingSkeleton({ className, count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70", className ?? "h-32")}
          aria-hidden
        />
      ))}
    </>
  );
}
