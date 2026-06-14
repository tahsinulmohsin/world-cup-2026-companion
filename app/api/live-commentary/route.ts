import { NextResponse } from "next/server";

// Force dynamic so Next.js never serves a stale cached response for live data
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";
// Try World Cup league slug first, fall back to general fifa.world
const LEAGUE_SLUGS = ["fifa.world-cup", "fifa.world"];

async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  let data: any = null;
  let usedSlug = LEAGUE_SLUGS[0];

  // Try each league slug until we get events
  for (const slug of LEAGUE_SLUGS) {
    try {
      const res = await fetchWithTimeout(`${ESPN_BASE}/${slug}/scoreboard`);
      if (!res.ok) continue;
      const json = await res.json();
      if (json.events && json.events.length > 0) {
        data = json;
        usedSlug = slug;
        break;
      }
    } catch {
      // timeout or network error — try next slug
    }
  }

  if (!data || !data.events || data.events.length === 0) {
    return NextResponse.json({ active: false, message: "No matches found." });
  }

  // Prefer live → most recent completed → next scheduled
  const targetEvent =
    data.events.find((e: any) => e.status?.type?.state === "in") ||
    data.events.find((e: any) => e.status?.type?.state === "post") ||
    data.events[0];

  if (!targetEvent?.id) {
    return NextResponse.json({ active: false, message: "No target event." });
  }

  let summary: any = null;
  try {
    const summaryRes = await fetchWithTimeout(
      `${ESPN_BASE}/${usedSlug}/summary?event=${targetEvent.id}`
    );
    if (summaryRes.ok) {
      summary = await summaryRes.json();
    }
  } catch {
    // summary unavailable — still return match header
  }

  const comp = targetEvent.competitions?.[0];
  const homeCompetitor = comp?.competitors?.find((c: any) => c.homeAway === "home");
  const awayCompetitor = comp?.competitors?.find((c: any) => c.homeAway === "away");

  return NextResponse.json({
    active: true,
    match: {
      id: targetEvent.id,
      name: targetEvent.name,
      shortName: targetEvent.shortName,
      state: targetEvent.status?.type?.state,
      clock: targetEvent.status?.displayClock,
      homeTeam: homeCompetitor?.team?.displayName ?? homeCompetitor?.team?.name,
      awayTeam: awayCompetitor?.team?.displayName ?? awayCompetitor?.team?.name,
      homeScore: homeCompetitor?.score,
      awayScore: awayCompetitor?.score,
    },
    // ESPN returns commentary oldest-first. Show the most recent 15 events,
    // newest first, so the latest action is at the top of the feed.
    commentary: (summary?.commentary ?? [])
      .slice(-15)
      .reverse()
      .map((c: any) => ({
        id: c.play?.id ?? c.sequence,
        time: c.time?.displayValue ?? "",
        text: c.text ?? "",
      })),
  });
}
