"use client";

import { cn } from "@/utils/cn";

export interface FilterOption {
  id: string;
  label: string;
}

/** Horizontal, sticky-friendly chip filter bar (single-select per bar). */
export default function FilterBar({
  options,
  active,
  onSelect,
  className
}: {
  options: FilterOption[];
  active: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={active === o.id}
          onClick={() => onSelect(o.id)}
          className={cn(
            "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-pitch-500",
            active === o.id
              ? "bg-pitch-700 text-white shadow-sm dark:bg-pitch-500 dark:text-night-950"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-800/70"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
