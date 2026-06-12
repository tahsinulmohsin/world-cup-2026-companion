import { NextResponse } from "next/server";
import { getFixtures } from "@/services/sync/syncService";

export const dynamic = "force-dynamic";

/** Lightweight live-status feed the client can poll during matchdays. */
export async function GET() {
  const res = await getFixtures();
  const live = (res.data ?? []).map((f) => ({
    id: f.id,
    status: f.status,
    minute: f.minute,
    homeScore: f.homeScore,
    awayScore: f.awayScore
  }));
  return NextResponse.json(
    { ok: res.ok, meta: res.meta, fixtures: live },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" } }
  );
}
