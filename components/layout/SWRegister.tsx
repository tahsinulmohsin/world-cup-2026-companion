"use client";

import { useEffect } from "react";
import { writeJSON } from "@/utils/storage";
import { STORAGE_KEYS } from "@/utils/constants";

/** Registers the service worker and runs the in-page reminder scheduler. */
export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {/* SW optional */});
    }
    writeJSON(STORAGE_KEYS.lastSync, new Date().toISOString());

    // Lightweight reminder loop: fires browser notifications for saved
    // reminders while the app is open (official kickoff times only).
    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.reminders);
        if (!raw || !("Notification" in window) || Notification.permission !== "granted") return;
        const reminders: Array<{ matchId: string; reminderTime: string; notified?: boolean }> = JSON.parse(raw);
        let changed = false;
        for (const r of reminders) {
          if (!r.notified && new Date(r.reminderTime).getTime() <= Date.now()) {
            new Notification("World Cup 2026", { body: "A match you're following kicks off soon.", icon: "/icons/icon-192.png" });
            r.notified = true;
            changed = true;
          }
        }
        if (changed) localStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(reminders));
      } catch {
        /* noop */
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);
  return null;
}
