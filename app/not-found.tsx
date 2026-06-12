import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-5xl" aria-hidden>🥅</p>
      <h1 className="mt-4 font-display text-2xl font-extrabold">Off target — page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you're looking for isn't in the squad.</p>
      <Link href="/" className="mt-5 inline-block rounded-full bg-pitch-700 px-5 py-2 text-sm font-semibold text-white dark:bg-pitch-500 dark:text-night-950">
        Back to home
      </Link>
    </div>
  );
}
