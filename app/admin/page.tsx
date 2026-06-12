import AdminSourceMonitor from "@/components/admin/AdminSourceMonitor";

export const metadata = { title: "Admin · Source Monitor" };

export default function AdminPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Official Source Monitor</h1>
        <p className="text-sm text-slate-500">
          Health, cache state and error logs for every official data adapter, plus manual refresh. Protected by
          ADMIN_PASSWORD.
        </p>
      </header>
      <AdminSourceMonitor />
    </div>
  );
}
