import Link from "next/link";
import Countdown from "@/components/home/Countdown";
import HomeMatches from "./HomeMatches";
import LiveCommentary from "@/components/home/LiveCommentary";
import HeroSlideshow, { type HeroImage } from "@/components/home/HeroSlideshow";
import NewsCard from "@/components/news/NewsCard";
import Leaderboard from "@/components/stats/Leaderboard";
import ErrorState from "@/components/ui/ErrorState";
import { getFixtures, getNews, getSquads, getStadiums, getTeams, getWatchParties } from "@/services/sync/syncService";

export const revalidate = 300;

/** Whole days since the Unix epoch (UTC) — used as a stable per-day seed. */
function daySeed(): number {
  const now = new Date();
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
}

/** Deterministic Fisher–Yates shuffle so the daily order is stable but rotates each day. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const next = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function HomePage() {
  const [fixturesRes, teamsRes, stadiumsRes, newsRes, squadsRes, partiesRes] = await Promise.all([
    getFixtures(), getTeams(), getStadiums(), getNews(), getSquads(), getWatchParties()
  ]);

  const fixtures = fixturesRes.data ?? [];
  const teams = teamsRes.data ?? [];
  const stadiums = Object.fromEntries((stadiumsRes.data ?? []).map((s) => [s.id, s]));

  // Daily-rotating slideshow of venue photos (Wikimedia Commons, via stadium data).
  const heroImages: HeroImage[] = seededShuffle(
    (stadiumsRes.data ?? [])
      .filter((s) => s.imageUrl)
      .map((s) => ({ url: s.imageUrl as string, caption: `${s.name} · ${s.city}` })),
    daySeed()
  ).slice(0, 8);
  const knockout = fixtures.filter((f) => f.isKnockout).slice(0, 8);
  const topScorers = (squadsRes.data ?? [])
    .filter((p) => p.goals !== null && p.goals > 0)
    .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))
    .slice(0, 5)
    .map((p) => ({ label: p.name, sub: p.nationality ?? undefined, value: p.goals ?? 0 }));

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-pitch-900 text-white">
        {/* Daily venue-photo slideshow behind the gradient */}
        <HeroSlideshow images={heroImages} />
        {/* Brand gradient overlay — keeps the green look, lets photos show through */}
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-800/95 via-pitch-900/85 to-night-950/90" />
        {/* Extra left darkening so the headline stays readable over bright photos */}
        <div className="absolute inset-0 bg-gradient-to-r from-pitch-950/80 via-pitch-950/20 to-transparent" />

        <div className="relative z-10 p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-trophy-400">North America · 11 June – 19 July 2026</p>
          <h1 className="mt-2 max-w-xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Your complete companion for the 2026 World Cup
          </h1>
          <p className="mt-2 max-w-lg text-sm text-pitch-100">
            48 teams, 16 stadiums, 104 matches — fixtures, live scores, standings, reminders and where to watch, all
            from official sources with attribution.
          </p>
          <div className="mt-6"><Countdown /></div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/fixtures" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-pitch-900 transition hover:bg-pitch-50">All fixtures</Link>
            <Link href="/my-world-cup" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-white/30 transition hover:bg-white/20">Build My World Cup ⭐</Link>
          </div>
        </div>
      </section>

      {fixturesRes.error && <ErrorState message={fixturesRes.error} />}

      <HomeMatches fixtures={fixtures} teams={teams} stadiums={stadiums} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Live Match Coverage</h2>
        </div>
        <LiveCommentary />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Top official stories</h2>
            <Link href="/news" className="text-sm font-medium text-pitch-600 hover:underline dark:text-pitch-400">All news →</Link>
          </div>
          {newsRes.data && newsRes.data.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {newsRes.data.slice(0, 4).map((n) => <NewsCard key={n.id} item={n} />)}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-700">
              Official tournament headlines appear here once the official news feed is configured.
            </p>
          )}
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Top scorers</h2>
            <Link href="/stats" className="text-sm font-medium text-pitch-600 hover:underline dark:text-pitch-400">Stats →</Link>
          </div>
          <Leaderboard title="Golden Boot race" rows={topScorers} />
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-card dark:bg-night-900 dark:shadow-card-dark">
            <h3 className="font-display text-base font-bold">Watch parties</h3>
            <p className="mt-1 text-sm text-slate-500">
              {(partiesRes.data?.length ?? 0) > 0
                ? `${partiesRes.data!.length} official fan events listed.`
                : "Official fan zones and screenings appear once event sources are connected."}
            </p>
            <Link href="/watch-parties" className="mt-2 inline-block text-sm font-medium text-pitch-600 hover:underline dark:text-pitch-400">Find a watch party →</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
