"use client";

import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
import KnockoutBracket from "@/components/knockout/KnockoutBracket";
import SpoilerScore from "@/components/matches/SpoilerScore";
import { sortGroup } from "@/services/normalizers/standings";
import type { Fixture, Stadium, Standing } from "@/types";

const IMAGE_FILENAME = "world-cup-2026-wall-chart.png";

/** Printable digital wall chart: all groups + the knockout path. */
export default function WallChart({
  fixtures,
  standings,
  stadiums
}: {
  fixtures: Fixture[];
  standings: Standing[];
  stadiums: Record<string, Stadium | undefined>;
}) {
  const groups = Array.from(new Set(standings.map((s) => s.group))).sort();
  const finalMatch = fixtures.find((f) => f.round === "Final");

  const captureRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "image" | "share">(null);
  const [toast, setToast] = useState("");

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3000);
  }, []);

  // Render the chart area to a PNG data URL, using a solid theme-aware background.
  const renderPng = useCallback(async (): Promise<string | null> => {
    if (!captureRef.current) return null;
    const dark = document.documentElement.classList.contains("dark");
    return toPng(captureRef.current, {
      backgroundColor: dark ? "#0a101a" : "#ffffff",
      pixelRatio: 2,
      cacheBust: true
    });
  }, []);

  const downloadImage = useCallback(async () => {
    setBusy("image");
    try {
      const dataUrl = await renderPng();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = IMAGE_FILENAME;
      a.click();
    } catch {
      flash("Couldn't generate the image. Please try again.");
    } finally {
      setBusy(null);
    }
  }, [renderPng, flash]);

  const shareChart = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: "World Cup 2026 Wall Chart",
      text: "Groups, knockout path and the road to the final — World Cup 2026."
    };
    setBusy("share");
    try {
      // Best: share the rendered image as a file (mobile / supported browsers).
      try {
        const dataUrl = await renderPng();
        if (dataUrl && typeof navigator.canShare === "function") {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], IMAGE_FILENAME, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ ...shareData, files: [file] });
            return;
          }
        }
      } catch {
        /* fall through to URL share / clipboard */
      }

      if (typeof navigator.share === "function") {
        await navigator.share({ ...shareData, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      flash("Link copied to clipboard!");
    } catch (err) {
      // Ignore user-cancelled share dialogs; surface real failures via clipboard.
      if (err instanceof DOMException && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        flash("Link copied to clipboard!");
      } catch {
        flash("Couldn't share. Copy the page URL manually.");
      }
    } finally {
      setBusy(null);
    }
  }, [renderPng, flash]);

  return (
    <div className="space-y-8 print:text-black">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-pitch-700 px-4 py-2 text-sm font-semibold text-white dark:bg-pitch-500 dark:text-night-950"
        >
          🖨 Print / save as PDF
        </button>
        <button
          onClick={downloadImage}
          disabled={busy !== null}
          className="rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:ring-slate-700 dark:hover:bg-night-800"
        >
          {busy === "image" ? "🖼 Generating…" : "🖼 Download as image"}
        </button>
        <button
          onClick={shareChart}
          disabled={busy !== null}
          className="rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:ring-slate-700 dark:hover:bg-night-800"
        >
          {busy === "share" ? "🔗 Sharing…" : "🔗 Share wall chart"}
        </button>
        {toast && <span className="text-sm font-medium text-pitch-600 dark:text-pitch-400">{toast}</span>}
      </div>

      <div ref={captureRef} className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Groups</h2>
        {groups.length === 0 ? (
          <p className="text-sm text-slate-500">Groups fill in automatically from official standings data.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <h3 className="mb-2 font-display text-sm font-bold">Group {g}</h3>
                <ol className="space-y-1 text-sm">
                  {sortGroup(standings.filter((s) => s.group === g)).map((s, i) => (
                    <li key={s.teamId} className="flex justify-between tabular-nums">
                      <span className="truncate">{i + 1}. {s.teamName}</span>
                      <span className="font-semibold">{s.points} pts</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Knockout path</h2>
        <KnockoutBracket fixtures={fixtures.filter((f) => f.isKnockout)} stadiums={stadiums} compact />
      </section>

      <section className="rounded-2xl border-2 border-trophy-500/60 p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-trophy-600 dark:text-trophy-400">🏆 World Cup 2026 winner</p>
        {finalMatch && finalMatch.status === "fulltime" ? (
          <div className="mt-2 font-display text-2xl font-extrabold">
            {finalMatch.winnerTeamId === finalMatch.homeTeamId ? finalMatch.homeTeamName : finalMatch.awayTeamName}
            <div className="mt-1"><SpoilerScore fixture={finalMatch} /></div>
          </div>
        ) : (
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-300 dark:text-slate-600">To be decided</p>
        )}
      </section>
      </div>
    </div>
  );
}
