"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import { useWatchCountry } from "@/hooks/usePreferences";
import { useTranslation } from "@/hooks/useTranslation";
import type { Broadcaster, SourceMeta } from "@/types";

interface ApiResponse {
  ok: boolean;
  data: Broadcaster[] | null;
  meta: SourceMeta;
}

export default function WatchOptionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { country, setCountry } = useWatchCountry();
  const { t } = useTranslation();
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoTried, setGeoTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/broadcasters")
      .then((r) => r.json())
      .then((d: ApiResponse) => setResp(d))
      .catch(() => setResp(null))
      .finally(() => setLoading(false));
  }, [open]);

  // Try browser geolocation once to suggest a country; denial → manual selector.
  useEffect(() => {
    if (!open || country || geoTried || typeof navigator === "undefined" || !navigator.geolocation) return;
    setGeoTried(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        // Coordinates alone don't give a country code without a geocoding API;
        // we keep this privacy-light and simply prompt the selector.
      },
      () => {
        /* permission denied → selector below */
      },
      { timeout: 4000 }
    );
  }, [open, country, geoTried]);

  const match = resp?.data?.find((b) => b.countryCode === country);

  return (
    <Modal open={open} onClose={onClose} title={t("actions.whereToWatch")}>
      <label className="block text-sm font-medium">
        Your country
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-night-900"
        >
          <option value="">Select a country…</option>
          {resp?.data?.map((b) => (
            <option key={b.countryCode} value={b.countryCode}>{b.countryName}</option>
          ))}
        </select>
      </label>

      <div className="mt-4">
        {loading && <p className="text-sm text-slate-500">Loading official broadcast data…</p>}
        {!loading && country && match && (
          <div className="space-y-3 text-sm">
            {match.tvChannels.length > 0 && (
              <p><span className="font-semibold">TV:</span> {match.tvChannels.join(", ")}</p>
            )}
            {match.streamingPlatforms.length > 0 && (
              <p><span className="font-semibold">Streaming:</span> {match.streamingPlatforms.join(", ")}</p>
            )}
            {match.languageOptions.length > 0 && (
              <p><span className="font-semibold">Commentary:</span> {match.languageOptions.join(", ")}</p>
            )}
            {match.isFree !== null && (
              <p><span className="font-semibold">Access:</span> {match.isFree ? "Free-to-air options available" : "Paid subscription may be required"}</p>
            )}
            {match.notes && <p className="text-slate-500">{match.notes}</p>}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 pt-2 dark:border-slate-700">
              <DataSourceBadge meta={match.sourceMeta} />
              <LastUpdatedBadge iso={match.sourceMeta.fetchedAt} />
            </div>
          </div>
        )}
        {!loading && country && !match && (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-night-800 dark:text-slate-300">
            {t("watch.noData")}
          </p>
        )}
        {!loading && !country && (
          <p className="text-sm text-slate-500">
            Select your country to see official TV and streaming options. We never guess broadcasters — only
            officially published rights-holder information is shown.
          </p>
        )}
      </div>
    </Modal>
  );
}
