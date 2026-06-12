import { memoryCache } from "@/services/cache/memoryCache";
import { SourceError } from "@/services/errors/sourceError";
import {
  registerSource,
  updateSourceStatus,
  recordSourceError
} from "@/services/sync/sourceStatus";
import type { SourceMeta, SourceResult } from "@/types";

const FETCH_TIMEOUT_MS = 10_000;
const MIN_FETCH_GAP_MS = 5_000; // conservative client-side rate limit
const lastAttempt = new Map<string, number>();

export interface OfficialSourceConfig<TData> {
  /** Stable id, e.g. "fifa-fixtures". */
  id: string;
  /** Human-readable, e.g. "FIFA Official Fixtures". */
  name: string;
  /** Env var that holds the official endpoint URL. */
  envUrlKey: string;
  /** Cache TTL in milliseconds. */
  ttlMs: number;
  /** Minimal structural validation of the raw payload. */
  validate: (raw: unknown) => boolean;
  /** Map the raw payload into normalized app models. */
  normalize: (raw: unknown, meta: SourceMeta) => TData;
  /** Small bundled sample for development; null → unavailable state. */
  fallback: () => TData | null;
  /** Optional license note shown in the UI attribution. */
  licenseNote?: string;
  /** Count items for the admin monitor. */
  count?: (data: TData) => number;
}

export interface OfficialSource<TData> {
  id: string;
  name: string;
  fetchData(opts?: { force?: boolean }): Promise<SourceResult<TData>>;
  invalidate(): void;
}

function nowISO(): string {
  return new Date().toISOString();
}

function unavailableMeta(cfg: OfficialSourceConfig<unknown>): SourceMeta {
  return {
    sourceName: cfg.name,
    sourceUrl: process.env[cfg.envUrlKey] ?? "",
    fetchedAt: nowISO(),
    lastUpdatedAt: nowISO(),
    reliability: "unavailable",
    licenseNote: cfg.licenseNote
  };
}

function sampleMeta(cfg: OfficialSourceConfig<unknown>): SourceMeta {
  return {
    sourceName: "Bundled sample data (development fallback)",
    sourceUrl: "",
    fetchedAt: nowISO(),
    lastUpdatedAt: nowISO(),
    reliability: "sample",
    licenseNote: "Sample data is illustrative only and must not ship as production tournament data."
  };
}

/**
 * Factory for official data source adapters. Every adapter:
 *  – reads its endpoint from an environment variable (never hardcoded),
 *  – respects a conservative rate limit and request timeout,
 *  – validates and normalizes the payload,
 *  – caches results with a TTL and serves stale data on errors,
 *  – stamps everything with SourceMeta for UI attribution,
 *  – falls back to bundled sample data (dev) or an unavailable state.
 */
export function createOfficialSource<TData>(
  cfg: OfficialSourceConfig<TData>
): OfficialSource<TData> {
  const cacheKey = `source:${cfg.id}`;

  registerSource({
    id: cfg.id,
    name: cfg.name,
    envKey: cfg.envUrlKey,
    configured: Boolean(process.env[cfg.envUrlKey]),
    lastFetchAt: null,
    lastSuccessAt: null,
    lastError: null,
    cacheState: "empty",
    itemCount: null,
    ttlMs: cfg.ttlMs
  });

  function fallbackResult(error?: string): SourceResult<TData> {
    const fb = cfg.fallback();
    if (fb !== null) {
      return { ok: true, data: fb, meta: sampleMeta(cfg), error };
    }
    return { ok: false, data: null, meta: unavailableMeta(cfg), error: error ?? "No official data available" };
  }

  async function fetchData(opts?: { force?: boolean }): Promise<SourceResult<TData>> {
    const url = process.env[cfg.envUrlKey];
    updateSourceStatus(cfg.id, { configured: Boolean(url), cacheState: memoryCache.state(cacheKey) });

    // 1. No official endpoint configured → sample fallback / unavailable.
    if (!url) {
      return fallbackResult("Official source endpoint is not configured (set " + cfg.envUrlKey + ").");
    }

    // 2. Fresh cache hit.
    if (!opts?.force) {
      const cached = memoryCache.get<SourceResult<TData>>(cacheKey);
      if (cached) return cached.value;
    }

    // 3. Conservative rate limiting between live attempts.
    const last = lastAttempt.get(cfg.id) ?? 0;
    if (!opts?.force && Date.now() - last < MIN_FETCH_GAP_MS) {
      const stale = memoryCache.getStale<SourceResult<TData>>(cacheKey);
      if (stale) return stale.value;
    }
    lastAttempt.set(cfg.id, Date.now());
    updateSourceStatus(cfg.id, { lastFetchAt: nowISO() });

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json, application/xml, text/xml;q=0.9, */*;q=0.8" },
        // Next.js data cache as a second layer:
        next: { revalidate: Math.floor(cfg.ttlMs / 1000) }
      });
      clearTimeout(timer);

      if (res.status === 429) throw new SourceError(cfg.id, "rate_limited", "Rate limited by official source", 429);
      if (!res.ok) throw new SourceError(cfg.id, "http", `HTTP ${res.status}`, res.status);

      const contentType = res.headers.get("content-type") ?? "";
      const raw: unknown = contentType.includes("json") ? await res.json() : await res.text();

      if (!cfg.validate(raw)) {
        throw new SourceError(cfg.id, "invalid_payload", "Payload failed validation");
      }

      const meta: SourceMeta = {
        sourceName: cfg.name,
        sourceUrl: url,
        fetchedAt: nowISO(),
        lastUpdatedAt: nowISO(),
        reliability: "official",
        licenseNote: cfg.licenseNote
      };
      const data = cfg.normalize(raw, meta);
      const result: SourceResult<TData> = { ok: true, data, meta };

      memoryCache.set(cacheKey, result, cfg.ttlMs);
      updateSourceStatus(cfg.id, {
        lastSuccessAt: nowISO(),
        lastError: null,
        cacheState: "fresh",
        itemCount: cfg.count ? cfg.count(data) : null
      });
      return result;
    } catch (err) {
      const message =
        err instanceof SourceError
          ? err.message
          : err instanceof Error && err.name === "AbortError"
            ? `[${cfg.id}] timeout after ${FETCH_TIMEOUT_MS}ms`
            : err instanceof Error
              ? err.message
              : "Unknown source error";
      recordSourceError(cfg.id, message);
      updateSourceStatus(cfg.id, { lastError: message, cacheState: memoryCache.state(cacheKey) });

      // Serve stale cache before falling back.
      const stale = memoryCache.getStale<SourceResult<TData>>(cacheKey);
      if (stale) return { ...stale.value, error: message };
      return fallbackResult(message);
    }
  }

  return {
    id: cfg.id,
    name: cfg.name,
    fetchData,
    invalidate: () => memoryCache.invalidate(cacheKey)
  };
}
