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

type MatchData = {
  id: string;
  name: string;
  shortName: string;
  state: "pre" | "in" | "post";
  clock: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
};

type CommentaryItem = {
  id: string;
  time: string;
  text: string;
};

type MatchWithCommentary = {
  match: MatchData;
  commentary: CommentaryItem[];
};

function parseEvent(event: any): MatchData | null {
  const comp = event.competitions?.[0];
  const homeCompetitor = comp?.competitors?.find((c: any) => c.homeAway === "home");
  const awayCompetitor = comp?.competitors?.find((c: any) => c.homeAway === "away");
  if (!event.id) return null;

  return {
    id: event.id,
    name: event.name,
    shortName: event.shortName,
    state: event.status?.type?.state,
    clock: event.status?.displayClock,
    homeTeam: homeCompetitor?.team?.displayName ?? homeCompetitor?.team?.name,
    awayTeam: awayCompetitor?.team?.displayName ?? awayCompetitor?.team?.name,
    homeScore: homeCompetitor?.score,
    awayScore: awayCompetitor?.score,
  };
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
    return NextResponse.json({ active: false, message: "No matches found.", matches: [] });
  }

  // Sort events: live first, then post-match, then scheduled
  const stateOrder: Record<string, number> = { in: 0, post: 1, pre: 2 };
  const sortedEvents = [...data.events].sort((a: any, b: any) => {
    const aState = stateOrder[a.status?.type?.state] ?? 3;
    const bState = stateOrder[b.status?.type?.state] ?? 3;
    return aState - bState;
  });

  // Fetch commentary for all events in parallel (capped at 6 to avoid timeouts)
  const eventsToProcess = sortedEvents.slice(0, 6);
  const results: MatchWithCommentary[] = [];

  await Promise.all(
    eventsToProcess.map(async (event: any) => {
      const match = parseEvent(event);
      if (!match) return;

      let commentary: CommentaryItem[] = [];
      try {
        const summaryRes = await fetchWithTimeout(
          `${ESPN_BASE}/${usedSlug}/summary?event=${event.id}`
        );
        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          // ESPN returns commentary oldest-first. Show the most recent 15 events,
          // newest first, so the latest action is at the top of the feed.
          commentary = (summary?.commentary ?? [])
            .slice(-15)
            .reverse()
            .map((c: any) => ({
              id: c.play?.id ?? c.sequence ?? `${event.id}-${Math.random()}`,
              time: c.time?.displayValue ?? "",
              text: c.text ?? "",
            }));
        }
      } catch {
        // commentary unavailable — still include the match header
      }

      results.push({ match, commentary });
    })
  );

  // Re-sort results to maintain live → post → pre order
  results.sort((a, b) => {
    const aState = stateOrder[a.match.state] ?? 3;
    const bState = stateOrder[b.match.state] ?? 3;
    return aState - bState;
  });

  if (results.length === 0) {
    return NextResponse.json({ active: false, message: "No target events.", matches: [] });
  }

  // Return backwards-compatible format: `match` + `commentary` point at the first match,
  // but also include `matches` array with ALL matches for the new multi-match UI.
  return NextResponse.json({
    active: true,
    match: results[0].match,
    commentary: results[0].commentary,
    matches: results,
  });
}
