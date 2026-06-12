import type { SourceStatus } from "@/types";

/** In-memory registry of source health, surfaced in the admin monitor. */
const statuses = new Map<string, SourceStatus>();
const errorLog: Array<{ at: string; sourceId: string; message: string }> = [];
const MAX_LOG = 50;

export function registerSource(init: SourceStatus): void {
  if (!statuses.has(init.id)) statuses.set(init.id, init);
}

export function updateSourceStatus(id: string, patch: Partial<SourceStatus>): void {
  const cur = statuses.get(id);
  if (cur) statuses.set(id, { ...cur, ...patch });
}

export function recordSourceError(sourceId: string, message: string): void {
  errorLog.unshift({ at: new Date().toISOString(), sourceId, message });
  if (errorLog.length > MAX_LOG) errorLog.length = MAX_LOG;
  // Clear, structured server-side log line:
  console.error(`[source:${sourceId}] ${message}`);
}

export function getSourceStatuses(): SourceStatus[] {
  return Array.from(statuses.values());
}

export function getErrorLog(): Array<{ at: string; sourceId: string; message: string }> {
  return [...errorLog];
}
