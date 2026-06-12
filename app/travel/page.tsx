import TravelGuideCard from "@/components/travel/TravelGuideCard";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import EmptyState from "@/components/ui/EmptyState";
import { genericMatchdayChecklist } from "@/services/officialSources/officialTravelSource";
import { getStadiums, getTravelGuides } from "@/services/sync/syncService";

export const metadata = { title: "Travel Guide" };
export const revalidate = 3600;

export default async function TravelPage() {
  const [stadiumsRes, travelRes] = await Promise.all([getStadiums(), getTravelGuides()]);
  const stadiums = stadiumsRes.data ?? [];
  const guides = travelRes.data ?? [];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Travel & Host City Guide</h1>
        <p className="text-sm text-slate-500">
          Venue access, transit and matchday tips. Detailed city guides come from official host city and transit
          sources; weather and maps activate when API keys are configured.
        </p>
      </header>
      {stadiums.length === 0 ? (
        <EmptyState title="Travel guides unavailable" message="Host city guides appear once venue data is available." icon="🧳" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stadiums.map((s) => {
            const guide = guides.find((g) => g.stadiumId === s.id);
            return <TravelGuideCard key={s.id} stadium={s} checklist={guide?.matchdayChecklist ?? genericMatchdayChecklist} />;
          })}
        </div>
      )}
      <DataSourceBadge meta={stadiumsRes.meta} />
    </div>
  );
}
