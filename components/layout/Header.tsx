"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import TimezoneToggle from "./TimezoneToggle";
import OfflineIndicator from "./OfflineIndicator";
import { NAV_ITEMS } from "@/utils/constants";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/utils/cn";

export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-night-800 dark:bg-night-950/85">
      <OfflineIndicator />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pitch-700 text-lg dark:bg-pitch-500" aria-hidden>⚽</span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            WC26 <span className="text-pitch-600 dark:text-pitch-400">Companion</span>
          </span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <TimezoneToggle />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="md:hidden"><ThemeToggle /></div>
      </div>
      <nav aria-label="Main" className="mx-auto max-w-6xl overflow-x-auto px-4 pb-2 [-webkit-overflow-scrolling:touch]">
        <ul className="flex gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-pitch-500",
                    active
                      ? "bg-pitch-700 text-white dark:bg-pitch-500 dark:text-night-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-night-800"
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
