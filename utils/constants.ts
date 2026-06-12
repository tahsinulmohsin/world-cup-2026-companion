export const APP_NAME = "World Cup 2026 Companion";
export const BD_TIMEZONE = "Asia/Dhaka";
export const TOURNAMENT_START_UTC = "2026-06-11T20:00:00Z";
export const TOURNAMENT_END_UTC = "2026-07-19T23:00:00Z";

export type TimezoneMode = "local" | "bangladesh" | "stadium" | "host";

export const STORAGE_KEYS = {
  theme: "wc26.theme",
  lang: "wc26.lang",
  favorites: "wc26.favorites",
  reminders: "wc26.reminders",
  predictions: "wc26.predictions",
  reactions: "wc26.reactions",
  spoilerFree: "wc26.spoilerFree",
  spoilerFavoritesOnly: "wc26.spoilerFavOnly",
  timezoneMode: "wc26.timezoneMode",
  watchCountry: "wc26.watchCountry",
  lastSync: "wc26.lastSync"
} as const;

export const NAV_ITEMS: Array<{ href: string; labelKey: string }> = [
  { href: "/", labelKey: "nav.home" },
  { href: "/fixtures", labelKey: "nav.fixtures" },
  { href: "/groups", labelKey: "nav.groups" },
  { href: "/knockout", labelKey: "nav.knockout" },
  { href: "/teams", labelKey: "nav.teams" },
  { href: "/players", labelKey: "nav.players" },
  { href: "/stadiums", labelKey: "nav.stadiums" },
  { href: "/stats", labelKey: "nav.stats" },
  { href: "/news", labelKey: "nav.news" },
  { href: "/travel", labelKey: "nav.travel" },
  { href: "/watch-parties", labelKey: "nav.watchParties" },
  { href: "/wall-chart", labelKey: "nav.wallChart" },
  { href: "/my-world-cup", labelKey: "nav.myWorldCup" },
  { href: "/reminders", labelKey: "nav.reminders" },
  { href: "/tickets", labelKey: "nav.tickets" },
  { href: "/settings", labelKey: "nav.settings" },
  { href: "/admin", labelKey: "nav.admin" }
];

/** Country options for the where-to-watch selector. */
export const WATCH_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "BD", name: "Bangladesh" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "JP", name: "Japan" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" }
];
