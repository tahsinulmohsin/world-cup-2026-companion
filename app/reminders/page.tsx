import RemindersClient from "./RemindersClient";
import { getFixtures, getStadiums } from "@/services/sync/syncService";

export const metadata = { title: "Reminders" };
export const revalidate = 300;

export default async function RemindersPage() {
  const [fixturesRes, stadiumsRes] = await Promise.all([getFixtures(), getStadiums()]);
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold">My Reminders</h1>
        <p className="text-sm text-slate-500">Notifications fire from official kickoff times while the app is open.</p>
      </header>
      <RemindersClient
        fixtures={fixturesRes.data ?? []}
        stadiums={Object.fromEntries((stadiumsRes.data ?? []).map((s) => [s.id, s]))}
      />
    </div>
  );
}
