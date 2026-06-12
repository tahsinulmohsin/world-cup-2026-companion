import { NextResponse } from "next/server";
import { getErrorLog, getSourceStatuses } from "@/services/sync/sourceStatus";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false; // admin disabled until a password is configured
  return req.headers.get("x-admin-password") === pw;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ statuses: getSourceStatuses(), errors: getErrorLog() });
}
