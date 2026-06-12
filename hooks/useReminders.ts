"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import type { Reminder, ReminderType } from "@/types";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

export function useReminders() {
  const [reminders, setReminders, hydrated] = useLocalStorage<Reminder[]>(STORAGE_KEYS.reminders, []);

  const addReminder = useCallback(
    (matchId: string, kickoffUTC: string, types: ReminderType[]) => {
      const reminderTime = new Date(new Date(kickoffUTC).getTime() - 30 * 60 * 1000).toISOString();
      setReminders((prev) => [
        ...prev.filter((r) => r.matchId !== matchId),
        { matchId, reminderTypes: types, reminderTime, createdAt: new Date().toISOString() }
      ]);
    },
    [setReminders]
  );

  const removeReminder = useCallback(
    (matchId: string) => setReminders((prev) => prev.filter((r) => r.matchId !== matchId)),
    [setReminders]
  );

  const hasReminder = useCallback((matchId: string) => reminders.some((r) => r.matchId === matchId), [reminders]);

  return { reminders, addReminder, removeReminder, hasReminder, hydrated };
}
