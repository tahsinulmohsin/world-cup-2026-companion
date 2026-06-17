/**
 * Shared store for community-submitted watch parties, backed by a Redis-style
 * KV store over its REST API (Vercel KV or Upstash — same protocol). Uses plain
 * fetch so there is no extra dependency.
 *
 * Configure with either pair of env vars (Vercel KV names preferred):
 *   KV_REST_API_URL        / KV_REST_API_TOKEN
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *
 * When unconfigured, isConfigured() is false and the app falls back to the
 * per-device localStorage behaviour (parties stay local-only).
 */

export interface CommunityWatchParty {
  id: string;
  title: string;
  venue: string;
  city: string;
  country: string;
  dateTime: string | null;
  organizer: string | null;
  description: string;
  kind: "fan_zone" | "sports_cafe" | "university" | "community" | "other";
  mapUrl: string | null;
  createdAt: string;
}

const KEY = "wc26:community-watch-parties";
const MAX_ITEMS = 200;

function creds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function isConfigured(): boolean {
  return creds() !== null;
}

async function command(parts: (string | number)[]): Promise<unknown> {
  const c = creds();
  if (!c) throw new Error("KV store not configured");
  const res = await fetch(c.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(parts),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`KV request failed: ${res.status}`);
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (json.error) throw new Error(json.error);
  return json.result ?? null;
}

export async function listParties(): Promise<CommunityWatchParty[]> {
  const raw = (await command(["GET", KEY])) as string | null;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CommunityWatchParty[]) : [];
  } catch {
    return [];
  }
}

export async function addParty(party: CommunityWatchParty): Promise<CommunityWatchParty[]> {
  const current = await listParties();
  const next = [party, ...current].slice(0, MAX_ITEMS);
  await command(["SET", KEY, JSON.stringify(next)]);
  return next;
}
