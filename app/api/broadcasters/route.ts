import { NextResponse } from "next/server";
import { getBroadcasters } from "@/services/sync/syncService";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await getBroadcasters();
  return NextResponse.json(res, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" }
  });
}
