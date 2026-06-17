import { NextResponse } from "next/server";
import { addParty, isConfigured, listParties, type CommunityWatchParty } from "@/services/community/watchPartyStore";

export const dynamic = "force-dynamic";

const KINDS = ["fan_zone", "sports_cafe", "university", "community", "other"] as const;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, parties: [] });
  }
  try {
    const parties = await listParties();
    return NextResponse.json({ configured: true, parties });
  } catch {
    return NextResponse.json({ configured: true, parties: [], error: "Failed to load community watch parties." }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { configured: false, error: "Shared watch parties aren't enabled on this deployment yet." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = str(body.title, 120);
  const venue = str(body.venue, 120);
  const city = str(body.city, 80);
  if (!title || !venue || !city) {
    return NextResponse.json({ error: "Event name, venue, and city are required." }, { status: 400 });
  }

  const kindRaw = str(body.kind, 20);
  const kind = (KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as CommunityWatchParty["kind"])
    : "community";

  const dateTime = str(body.dateTime, 40);
  const mapUrl = str(body.mapUrl, 500);

  const party: CommunityWatchParty = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    venue,
    city,
    country: str(body.country, 80) || "Unknown",
    dateTime: dateTime || null,
    organizer: str(body.organizer, 80) || null,
    description: str(body.description, 500),
    kind,
    mapUrl: /^https?:\/\//.test(mapUrl) ? mapUrl : null,
    createdAt: new Date().toISOString()
  };

  try {
    const parties = await addParty(party);
    return NextResponse.json({ configured: true, party, parties });
  } catch {
    return NextResponse.json({ error: "Couldn't save the watch party. Please try again." }, { status: 502 });
  }
}
