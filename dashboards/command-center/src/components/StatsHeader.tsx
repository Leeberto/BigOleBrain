"use client";

import { CommandCenterStats } from "@/lib/types";

interface StatsHeaderProps {
  stats: CommandCenterStats;
}

export function StatsHeader({ stats }: StatsHeaderProps) {
  const cards = [
    {
      label: "Open Actions",
      value: stats.openActions,
      color: "text-status-open",
    },
    {
      label: "Overdue",
      value: stats.overdueActions,
      color: "text-red-400",
      pulse: stats.overdueActions > 0,
    },
    {
      label: "Thoughts This Week",
      value: stats.thoughtsThisWeek,
      color: "text-accent",
    },
    {
      label: "Stale Loops",
      value: stats.staleLoops,
      color: "text-status-in_progress",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-bg-card px-4 py-3"
        >
          <div className="text-xs text-text-muted">{card.label}</div>
          <div
            className={`text-2xl font-bold ${card.color} ${
              card.pulse ? "animate-pulse" : ""
            }`}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
