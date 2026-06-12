/** Typed error for official-source failures, kept small for log clarity. */
export type SourceErrorKind =
  | "not_configured"
  | "network"
  | "http"
  | "invalid_payload"
  | "rate_limited"
  | "timeout"
  | "unknown";

export class SourceError extends Error {
  kind: SourceErrorKind;
  sourceId: string;
  status?: number;

  constructor(sourceId: string, kind: SourceErrorKind, message: string, status?: number) {
    super(`[${sourceId}] ${kind}: ${message}`);
    this.name = "SourceError";
    this.kind = kind;
    this.sourceId = sourceId;
    this.status = status;
  }
}
