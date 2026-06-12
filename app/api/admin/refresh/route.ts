import { NextResponse } from "next/server";
import { refreshAll, refreshScope, type SyncScope } from "@/services/sync/syncService";

export const dynamic = "force-dynamic";

const SCOPES: SyncScope[] = [
  "fixtures", "standings", "matchCentre", "teams", "squads",
  "broadcasters", "stadiums", "news", "tickets", "travel", "watchParties"
];

export async function POST(req: Request) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || req.headers.get("x-admin-password") !== pw) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { scope?: string };
  if (body.scope && SCOPES.includes(body.scope as SyncScope)) {
    return NextResponse.json(await refreshScope(body.scope as SyncScope));
  }
  return NextResponse.json(await refreshAll());
}
