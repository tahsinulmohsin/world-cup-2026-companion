"use client";

import { useState } from "react";
import WatchOptionsModal from "@/components/matches/WatchOptionsModal";

export default function WatchSectionClient() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-pitch-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pitch-800 dark:bg-pitch-500 dark:text-night-950 dark:hover:bg-pitch-400"
      >
        📺 Where to watch this match
      </button>
      <WatchOptionsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
