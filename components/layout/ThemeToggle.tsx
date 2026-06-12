"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/utils/constants";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEYS.theme) as Theme | null) ?? "system";
    setTheme(saved);
    setMounted(true);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if ((localStorage.getItem(STORAGE_KEYS.theme) ?? "system") === "system") applyTheme("system");
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  function cycle() {
    const next: Theme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
    applyTheme(next);
  }

  if (!mounted) return <span className="h-9 w-9" aria-hidden />;
  const icon = theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️";
  return (
    <button
      onClick={cycle}
      className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-slate-100 dark:hover:bg-night-800"
      aria-label={`Theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}
