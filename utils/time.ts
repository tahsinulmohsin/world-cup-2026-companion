import { BD_TIMEZONE, type TimezoneMode } from "./constants";

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

export function formatInTimezone(
  isoUTC: string,
  timeZone: string,
  opts?: { dateOnly?: boolean; timeOnly?: boolean; locale?: string }
): string {
  const date = new Date(isoUTC);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    const fmt = new Intl.DateTimeFormat(opts?.locale ?? "en", {
      timeZone,
      ...(opts?.timeOnly
        ? { hour: "2-digit", minute: "2-digit" }
        : opts?.dateOnly
          ? { weekday: "short", day: "numeric", month: "short" }
          : { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    });
    return fmt.format(date);
  } catch {
    return date.toUTCString();
  }
}

export function resolveTimezone(mode: TimezoneMode, stadiumTimezone?: string | null): { tz: string; label: string } {
  switch (mode) {
    case "bangladesh":
      return { tz: BD_TIMEZONE, label: "Bangladesh time" };
    case "stadium":
    case "host":
      return stadiumTimezone
        ? { tz: stadiumTimezone, label: mode === "stadium" ? "Stadium local time" : "Host country time" }
        : { tz: getUserTimezone(), label: "Your local time" };
    default:
      return { tz: getUserTimezone(), label: "Your local time" };
  }
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
  const mins = Math.round(Math.abs(diff) / 60000);
  const suffix = diff >= 0 ? "ago" : "from now";
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ${suffix}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ${suffix}`;
  const days = Math.round(hours / 24);
  return `${days} d ${suffix}`;
}

export function isToday(isoUTC: string, timeZone: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(new Date(isoUTC)) === fmt.format(new Date());
}

export function isTomorrow(isoUTC: string, timeZone: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return fmt.format(new Date(isoUTC)) === fmt.format(tomorrow);
}
