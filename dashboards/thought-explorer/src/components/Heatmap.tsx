"use client";

import { useMemo } from "react";

interface HeatmapProps {
  dates: string[]; // ISO date strings of thought created_at
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const WEEKS = 26; // ~6 months

function getIntensity(count: number): string {
  if (count === 0) return "bg-bg-card";
  if (count === 1) return "bg-accent/20";
  if (count === 2) return "bg-accent/40";
  if (count <= 4) return "bg-accent/60";
  return "bg-accent/90";
}

export function Heatmap({ dates }: HeatmapProps) {
  const { grid, maxWeekStart } = useMemo(() => {
    // Count thoughts per date
    const counts: Record<string, number> = {};
    for (const iso of dates) {
      const day = iso.slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    }

    // Build grid: last WEEKS weeks ending today
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    // End of grid is this Saturday (end of week)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeek));

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - WEEKS * 7 + 1);

    const grid: { date: string; count: number; dayOfWeek: number }[][] = [];
    let currentWeek: { date: string; count: number; dayOfWeek: number }[] = [];
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      const key = cursor.toISOString().slice(0, 10);
      currentWeek.push({
        date: key,
        count: counts[key] || 0,
        dayOfWeek: cursor.getDay(),
      });
      if (cursor.getDay() === 6) {
        grid.push(currentWeek);
        currentWeek = [];
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    if (currentWeek.length) grid.push(currentWeek);

    return { grid, maxWeekStart: startDate.toISOString().slice(0, 10) };
  }, [dates]);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-3 w-6 text-[9px] text-text-muted leading-3 text-right pr-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((cell) => (
              <div
                key={cell.date}
                className={`h-3 w-3 rounded-[2px] ${getIntensity(cell.count)} transition-colors`}
                title={`${cell.date}: ${cell.count} thought${cell.count !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-1 text-[10px] text-text-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 5].map((n) => (
          <div
            key={n}
            className={`h-3 w-3 rounded-[2px] ${getIntensity(n)}`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
