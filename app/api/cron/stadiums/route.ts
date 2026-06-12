import { NextResponse } from "next/server";
import { refreshScope } from "@/services/sync/syncService";

export const dynamic = "force-dynamic";

/** Vercel Cron entrypoint — authenticated with CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await refreshScope("stadiums");
  return NextResponse.json(result);
}
