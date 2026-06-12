import type { Fixture, Stadium } from "@/types";

function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Build an RFC 5545 .ics file from official fixture times (stored in UTC). */
export function buildICS(
  fixtures: Fixture[],
  stadiums: Record<string, Stadium | undefined>,
  opts?: { calendarName?: string; timeNote?: string }
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//World Cup 2026 Companion//EN",
    `X-WR-CALNAME:${escapeText(opts?.calendarName ?? "World Cup 2026")}`
  ];
  for (const f of fixtures) {
    const stadium = f.stadiumId ? stadiums[f.stadiumId] : undefined;
    const start = icsDate(f.dateTimeUTC);
    const end = icsDate(new Date(new Date(f.dateTimeUTC).getTime() + 2 * 60 * 60 * 1000).toISOString());
    const location = stadium ? `${stadium.name}, ${stadium.city}, ${stadium.country}` : "Venue TBC";
    const desc = [
      `${f.round}${f.group ? ` · Group ${f.group}` : ""}`,
      opts?.timeNote ?? "",
      `Source: ${f.sourceMeta.sourceName}`
    ].filter(Boolean).join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:wc26-${f.id}@worldcup2026companion`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeText(`${f.homeTeamName} vs ${f.awayTeamName}`)}`,
      `LOCATION:${escapeText(location)}`,
      `DESCRIPTION:${escapeText(desc)}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(f: Fixture, stadiumLabel?: string): string {
  const start = icsDate(f.dateTimeUTC);
  const end = icsDate(new Date(new Date(f.dateTimeUTC).getTime() + 2 * 60 * 60 * 1000).toISOString());
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${f.homeTeamName} vs ${f.awayTeamName} — World Cup 2026`,
    dates: `${start}/${end}`,
    details: `${f.round}${f.group ? ` · Group ${f.group}` : ""} · Times from ${f.sourceMeta.sourceName}`,
    location: stadiumLabel ?? ""
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
