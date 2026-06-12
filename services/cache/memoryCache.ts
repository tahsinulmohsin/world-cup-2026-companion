/**
 * Lightweight in-memory cache with TTL, shared across requests on a warm
 * serverless instance. Stale entries are kept so adapters can serve
 * stale-while-error data instead of breaking the UI.
 */
interface Entry<T> {
  value: T;
  storedAt: number;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export const memoryCache = {
  get<T>(key: string): { value: T; storedAt: number } | null {
    const e = store.get(key) as Entry<T> | undefined;
    if (!e) return null;
    if (Date.now() > e.expiresAt) return null;
    return { value: e.value, storedAt: e.storedAt };
  },

  /** Returns the entry even if expired (stale-while-error). */
  getStale<T>(key: string): { value: T; storedAt: number; isStale: boolean } | null {
    const e = store.get(key) as Entry<T> | undefined;
    if (!e) return null;
    return { value: e.value, storedAt: e.storedAt, isStale: Date.now() > e.expiresAt };
  },

  set<T>(key: string, value: T, ttlMs: number): void {
    store.set(key, { value, storedAt: Date.now(), expiresAt: Date.now() + ttlMs });
  },

  invalidate(key: string): void {
    store.delete(key);
  },

  state(key: string): "fresh" | "stale" | "empty" {
    const e = store.get(key);
    if (!e) return "empty";
    return Date.now() > e.expiresAt ? "stale" : "fresh";
  },

  clearAll(): void {
    store.clear();
  }
};
