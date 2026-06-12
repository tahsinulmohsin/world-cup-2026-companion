import en from "./en.json";
import bn from "./bn.json";
import es from "./es.json";
import fr from "./fr.json";
import ar from "./ar.json";

export type Language = "en" | "bn" | "es" | "fr" | "ar";

export const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" }
];

type Dictionary = Record<string, string>;
const dictionaries: Record<Language, Dictionary> = {
  en: en as Dictionary,
  bn: bn as Dictionary,
  // es/fr/ar ship as structured-but-empty files; missing keys fall back to English.
  es: es as Dictionary,
  fr: fr as Dictionary,
  ar: ar as Dictionary
};

export function getDictionary(lang: Language): Dictionary {
  return dictionaries[lang] ?? dictionaries.en;
}
