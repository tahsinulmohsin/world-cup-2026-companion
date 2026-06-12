export default function EmptyState({
  title,
  message,
  icon = "⚽"
}: {
  title: string;
  message: string;
  icon?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-12 text-center">
      <div className="text-3xl" aria-hidden>{icon}</div>
      <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
