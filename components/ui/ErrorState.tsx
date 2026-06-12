export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-300/60 bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/30 px-5 py-4 text-sm text-rose-700 dark:text-rose-300">
      <p className="font-semibold">Official source error</p>
      <p className="mt-1">{message} The page keeps working with the last available data.</p>
    </div>
  );
}
