import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CalendarItem } from "@/lib/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

  // Date range for the month (with padding for calendar grid)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const padStart = new Date(startDate);
  padStart.setDate(padStart.getDate() - padStart.getDay());
  const padEnd = new Date(endDate);
  padEnd.setDate(padEnd.getDate() + (6 - padEnd.getDay()));

  const from = padStart.toISOString().slice(0, 10);
  const to = padEnd.toISOString().slice(0, 10);

  const items: CalendarItem[] = [];

  // 1. Actions — colored by status
  const { data: actions } = await supabase
    .from("actions")
    .select("id, content, due_date, status")
    .not("due_date", "is", null)
    .gte("due_date", from)
    .lte("due_date", to);

  if (actions) {
    const statusColors: Record<string, string> = {
      open: "#3b82f6",
      in_progress: "#f59e0b",
      done: "#22c55e",
      cancelled: "#6b7280",
    };
    for (const a of actions) {
      items.push({
        id: a.id,
        source: "action",
        title: a.content,
        date: a.due_date,
        status: a.status,
        color: statusColors[a.status] || "#3b82f6",
      });
    }
  }

  // 2. Activities — purple
  const { data: activities } = await supabase
    .from("activities")
    .select("id, name, date, day_of_week, start_time")
    .or(`date.gte.${from},day_of_week.not.is.null`);

  if (activities) {
    for (const a of activities) {
      if (a.date) {
        const d = a.date.slice(0, 10);
        if (d >= from && d <= to) {
          items.push({
            id: a.id,
            source: "activity",
            title: a.name,
            date: d,
            color: "#a855f7",
          });
        }
      } else if (a.day_of_week != null) {
        const cursor = new Date(padStart);
        while (cursor <= padEnd) {
          if (cursor.getDay() === a.day_of_week) {
            items.push({
              id: `${a.id}-${cursor.toISOString().slice(0, 10)}`,
              source: "activity",
              title: `${a.name}${a.start_time ? ` @ ${a.start_time}` : ""}`,
              date: cursor.toISOString().slice(0, 10),
              color: "#a855f7",
            });
          }
          cursor.setDate(cursor.getDate() + 1);
        }
      }
    }
  }

  // 3. Important dates — red
  const { data: dates } = await supabase
    .from("important_dates")
    .select("id, label, date, type")
    .gte("date", from)
    .lte("date", to);

  if (dates) {
    for (const d of dates) {
      items.push({
        id: d.id,
        source: "important_date",
        title: `${d.label}${d.type ? ` (${d.type})` : ""}`,
        date: d.date.slice(0, 10),
        color: "#ef4444",
      });
    }
  }

  // 4. Maintenance tasks — coral (column is "name", not "title")
  const { data: maintenance } = await supabase
    .from("maintenance_tasks")
    .select("id, name, next_due")
    .not("next_due", "is", null)
    .gte("next_due", from)
    .lte("next_due", to);

  if (maintenance) {
    for (const m of maintenance) {
      items.push({
        id: m.id,
        source: "maintenance",
        title: m.name,
        date: m.next_due.slice(0, 10),
        color: "#fb7185",
      });
    }
  }

  return NextResponse.json({ items });
}
