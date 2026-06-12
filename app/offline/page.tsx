export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="py-24 text-center">
      <p className="text-5xl" aria-hidden>📡</p>
      <h1 className="mt-4 font-display text-2xl font-extrabold">You're offline</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Pages you've visited, your favorite teams, reminders and the last synced fixtures are still available.
        Live scores resume when you're back online.
      </p>
    </div>
  );
}
