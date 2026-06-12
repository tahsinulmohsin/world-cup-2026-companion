"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { Language } from "@/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useTranslation();
  return (
    <label className="inline-flex items-center gap-1.5 text-sm">
      <span className="sr-only">Language</span>
      <span aria-hidden>🌐</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Language)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-night-900"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}
