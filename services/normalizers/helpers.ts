/** Safe coercion helpers shared by all normalizers. */
export function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}
export function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
export function bool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}
export function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
export function asArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    for (const key of ["items", "data", "results", "matches", "fixtures", "standings", "teams", "players", "stadiums"]) {
      if (Array.isArray(o[key])) return o[key] as unknown[];
    }
  }
  return [];
}
