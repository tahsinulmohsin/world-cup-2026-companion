"use client";

import { useOnline } from "@/hooks/useOnline";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import { relativeTime } from "@/utils/time";

export default function OfflineIndicator() {
  const online = useOnline();
  const [lastSync] = useLocalStorage<string | null>(STORAGE_KEYS.lastSync, null);
  if (online) return null;
  return (
    <div className="bg-amber-500/15 px-4 py-1.5 text-center text-xs font-medium text-amber-800 dark:text-amber-300">
      You're offline — showing saved data{lastSync ? ` (last synced ${relativeTime(lastSync)})` : ""}.
    </div>
  );
}
