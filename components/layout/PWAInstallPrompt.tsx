"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || dismissed) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-night-900 p-4 text-white shadow-xl">
      <span className="text-2xl" aria-hidden>⚽</span>
      <p className="flex-1 text-sm">Install the World Cup companion for offline fixtures and reminders.</p>
      <button
        onClick={async () => {
          await deferred.prompt();
          setDeferred(null);
        }}
        className="rounded-full bg-pitch-500 px-3 py-1.5 text-sm font-semibold text-night-950"
      >
        Install
      </button>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="text-slate-400">✕</button>
    </div>
  );
}
