import { notFound } from "next/navigation";
import StadiumDetails from "@/components/stadiums/StadiumDetails";
import MatchList from "@/components/matches/MatchList";
import { getFixtures, getStadium, getTeams } from "@/services/sync/syncService";

export const revalidate = 3600;

export default async function StadiumDetailPage({ params }: { params: { id: string } }) {
  const stadium = await getStadium(params.id);
  if (!stadium) notFound();

  const [fixturesRes, teamsRes] = await Promise.all([getFixtures(), getTeams()]);
  const matches = (fixturesRes.data ?? [])
    .filter((f) => f.stadiumId === stadium.id)
    .sort((a, b) => a.dateTimeUTC.localeCompare(b.dateTimeUTC));
  const teamMap = Object.fromEntries((teamsRes.data ?? []).map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <section className={`relative overflow-hidden rounded-3xl ${!stadium.imageUrl ? 'bg-gradient-to-br from-pitch-800 via-pitch-900 to-night-950' : 'bg-night-950'} p-6 text-white sm:p-8`}>
        {stadium.imageUrl && (
          <div className="absolute inset-0 opacity-40">
            <img src={stadium.imageUrl} alt={stadium.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/60 to-transparent"></div>
          </div>
        )}
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-trophy-400">{stadium.city} · {stadium.country}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">{stadium.name}</h1>
          <p className="mt-1 text-sm text-pitch-100">
            {stadium.capacity ? `${stadium.capacity.toLocaleString()} capacity · ` : ""}{matches.length} tournament match{matches.length === 1 ? "" : "es"}
          </p>
        </div>
      </section>

      <StadiumDetails stadium={stadium} />

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Matches at this stadium</h2>
        <MatchList
          fixtures={matches}
          stadiums={{ [stadium.id]: stadium }}
          teams={teamMap}
          emptyTitle="No matches assigned"
          emptyMessage="Matches hosted here appear from the official schedule."
        />
      </section>
    </div>
  );
}
