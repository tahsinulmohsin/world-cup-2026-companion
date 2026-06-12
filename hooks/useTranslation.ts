"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import { getDictionary, LANGUAGES, type Language } from "@/i18n";

export function useTranslation() {
  const [lang, setLang] = useLocalStorage<Language>(STORAGE_KEYS.lang, "en");
  const dict = getDictionary(lang);

  const t = useCallback(
    (key: string): string => dict[key] ?? getDictionary("en")[key] ?? key,
    [dict]
  );

  return { t, lang, setLang, languages: LANGUAGES };
}
