import SettingsClient from "./SettingsClient";
import { getTeams } from "@/services/sync/syncService";

export const metadata = { title: "Settings" };
export const revalidate = 3600;

export default async function SettingsPage() {
  const teamsRes = await getTeams();
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Settings</h1>
        <p className="text-sm text-slate-500">All preferences are stored locally on this device.</p>
      </header>
      <SettingsClient teams={teamsRes.data ?? []} />
    </div>
  );
}
