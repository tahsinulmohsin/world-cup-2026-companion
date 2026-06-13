import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard", {
      next: { revalidate: 30 }
    });
    
    if (!res.ok) {
      return NextResponse.json({ active: false, error: "Failed to fetch scoreboard" }, { status: res.status });
    }

    const data = await res.json();
    
    // Find live match, else latest completed, else next scheduled
    let targetEvent = data.events?.find((e: any) => e.status.type.state === "in");
    
    if (!targetEvent) {
       if (!data.events || data.events.length === 0) {
          return NextResponse.json({ active: false, message: "No matches today." });
       }
       targetEvent = data.events.find((e: any) => e.status.type.state === "post") || data.events[0];
    }
    
    const summaryRes = await fetch(`http://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${targetEvent.id}`, {
      next: { revalidate: 30 }
    });

    if (!summaryRes.ok) {
      return NextResponse.json({ active: false, error: "Failed to fetch summary" }, { status: summaryRes.status });
    }

    const summary = await summaryRes.json();
    
    const homeCompetitor = targetEvent.competitions[0].competitors.find((c: any) => c.homeAway === "home");
    const awayCompetitor = targetEvent.competitions[0].competitors.find((c: any) => c.homeAway === "away");



    return NextResponse.json({
      active: true,
      match: {
        id: targetEvent.id,
        name: targetEvent.name,
        shortName: targetEvent.shortName,
        state: targetEvent.status.type.state,
        clock: targetEvent.status.displayClock,
        homeTeam: homeCompetitor?.team?.name,
        awayTeam: awayCompetitor?.team?.name,
        homeScore: homeCompetitor?.score,
        awayScore: awayCompetitor?.score,
      },
      commentary: summary.commentary?.slice(0, 15).map((c: any) => ({
        id: c.play?.id || c.sequence,
        time: c.time?.displayValue || "",
        text: c.text,
      })) || []
    });

  } catch (error) {
    return NextResponse.json({ active: false, error: "Internal server error fetching commentary" }, { status: 500 });
  }
}
