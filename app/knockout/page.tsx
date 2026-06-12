import Link from "next/link";
import KnockoutBracket from "@/components/knockout/KnockoutBracket";
import ErrorState from "@/components/ui/ErrorState";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import { getFixtures, getStadiums } from "@/services/sync/syncService";

export const metadata = { title: "Knockout Bracket" };
export const revalidate = 300;

export default async function KnockoutPage() {
  const [fixturesRes, stadiumsRes] = await Promise.all([getFixtures(), getStadiums()]);
  const knockout = (fixturesRes.data ?? []).filter((f) => f.isKnockout);
  const stadiums = Object.fromEntries((stadiumsRes.data ?? []).map((s) => [s.id, s]));

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Knockout Bracket</h1>
          <p className="text-sm text-slate-500">Round of 32 to the Final — progression updates from official results.</p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge meta={fixturesRes.meta} />
          <LastUpdatedBadge iso={fixturesRes.meta.fetchedAt} />
        </div>
      </header>
      {fixturesRes.error && <ErrorState message={fixturesRes.error} />}
      <KnockoutBracket fixtures={knockout} stadiums={stadiums} />
      <p className="text-sm text-slate-500">
        Want a printable version? Open the{" "}
        <Link href="/wall-chart" className="font-medium text-pitch-600 hover:underline dark:text-pitch-400">wall chart</Link>{" "}
        and use print / save as PDF.
      </p>
    </div>
  );
}
