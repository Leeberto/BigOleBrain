import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysAgoLabel(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "1 day late";
  if (days < 0) return `${Math.abs(days)} days late`;
  return `in ${days} days`;
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return daysUntil(dueDate) < 0;
}

export function isStale(createdAt: string, thresholdDays: number): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const created = new Date(createdAt);
  created.setHours(0, 0, 0, 0);
  const daysSince = Math.ceil(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSince > thresholdDays;
}

export function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function calculateNextDue(
  currentDue: string | null,
  recurrence: string
): string {
  const base = currentDue ? new Date(currentDue) : new Date();
  switch (recurrence) {
    case "daily":
      base.setDate(base.getDate() + 1);
      break;
    case "weekly":
      base.setDate(base.getDate() + 7);
      break;
    case "monthly":
      base.setMonth(base.getMonth() + 1);
      break;
  }
  return base.toISOString().split("T")[0];
}
