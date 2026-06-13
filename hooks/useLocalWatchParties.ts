"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "wc26.localWatchParties";

export interface LocalWatchParty {
  id: string;
  title: string;
  venue: string;
  city: string;
  country: string;
  dateTime: string | null;
  organizer: string | null;
  description: string;
  kind: "fan_zone" | "sports_cafe" | "university" | "community" | "other";
  mapUrl: string | null;
  createdAt: string;
}

let listeners: Array<() => void> = [];
function emitChange() { listeners.forEach((l) => l()); }

const EMPTY_ARRAY: LocalWatchParty[] = [];
let cachedSnapshot: LocalWatchParty[] | null = null;
let cachedRawString: string | null = null;

function getSnapshot(): LocalWatchParty[] {
  if (typeof window === "undefined") return EMPTY_ARRAY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_ARRAY;
    if (raw === cachedRawString && cachedSnapshot) return cachedSnapshot;
    
    cachedRawString = raw;
    const parsed = JSON.parse(raw);
    cachedSnapshot = Array.isArray(parsed) ? parsed : EMPTY_ARRAY;
    return cachedSnapshot;
  } catch {
    return EMPTY_ARRAY;
  }
}

function getServerSnapshot(): LocalWatchParty[] {
  return EMPTY_ARRAY;
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

export function useLocalWatchParties() {
  const localParties = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addParty = useCallback((party: Omit<LocalWatchParty, "id" | "createdAt">) => {
    const current = getSnapshot();
    const newParty: LocalWatchParty = {
      ...party,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newParty, ...current]));
    emitChange();
  }, []);

  const removeParty = useCallback((id: string) => {
    const current = getSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((p) => p.id !== id)));
    emitChange();
  }, []);

  return { localParties, addParty, removeParty };
}
