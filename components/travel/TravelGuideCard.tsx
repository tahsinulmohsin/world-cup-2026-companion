import Link from "next/link";
import type { Stadium } from "@/types";

export default function TravelGuideCard({ stadium, checklist }: { stadium: Stadium; checklist: string[] }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
      <h3 className="font-display text-base font-bold">{stadium.city}, {stadium.country}</h3>
      <p className="text-sm text-slate-500">{stadium.name}</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div><dt className="inline font-semibold">✈️ Airport: </dt><dd className="inline">{stadium.localInfo.nearestAirport ?? "From official source"}</dd></div>
        <div><dt className="inline font-semibold">🚇 Transit: </dt><dd className="inline">{stadium.localInfo.publicTransport ?? "From official source"}</dd></div>
        <div><dt className="inline font-semibold">🛡 Tips: </dt><dd className="inline">{stadium.localInfo.safetyTips ?? "From official source"}</dd></div>
      </dl>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-pitch-600 dark:text-pitch-400">Matchday checklist</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {checklist.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </details>
      <Link href={`/stadiums/${stadium.id}`} className="mt-3 inline-block text-sm font-medium text-pitch-600 hover:underline dark:text-pitch-400">
        Full stadium guide →
      </Link>
    </article>
  );
}
