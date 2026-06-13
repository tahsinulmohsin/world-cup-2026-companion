import { getFixtures, getTeams, getStadiums } from "@/services/sync/syncService";

export const dynamic = "force-dynamic";

export async function GET() {
  const [fixturesRes, teamsRes, stadiumsRes] = await Promise.all([
    getFixtures(),
    getTeams(),
    getStadiums()
  ]);

  const fixtures = fixturesRes.data ?? [];
  const teams = Object.fromEntries((teamsRes.data ?? []).map(t => [t.id, t]));
  const stadiums = Object.fromEntries((stadiumsRes.data ?? []).map(s => [s.id, s]));

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//World Cup 2026 Companion//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:World Cup 2026",
    "X-WR-TIMEZONE:UTC"
  ];

  for (const match of fixtures) {
    const homeTeam = match.homeTeamId ? teams[match.homeTeamId]?.name || match.homeTeamId : "TBD";
    const awayTeam = match.awayTeamId ? teams[match.awayTeamId]?.name || match.awayTeamId : "TBD";
    const stadium = match.stadiumId ? stadiums[match.stadiumId]?.name || match.stadiumId : "TBD";

    const dtStart = new Date(match.dateTimeUTC);
    // Rough estimate of 2 hours per match
    const dtEnd = new Date(dtStart.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:match-${match.id}@wc26companion`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(dtStart)}`,
      `DTEND:${formatDate(dtEnd)}`,
      `SUMMARY:${homeTeam} vs ${awayTeam}`,
      `LOCATION:${stadium}`,
      `DESCRIPTION:Match ${match.matchNumber} - ${match.round}\\nView details: https://world-cup-2026-companion-xi.vercel.app/matches/${match.id}`,
      "END:VEVENT"
    );
  }

  icsContent.push("END:VCALENDAR");

  return new Response(icsContent.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="world-cup-2026.ics"'
    }
  });
}
