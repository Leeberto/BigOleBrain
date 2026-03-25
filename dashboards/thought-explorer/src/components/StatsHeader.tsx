"use client";

import { ThoughtStats } from "@/lib/types";

interface StatsHeaderProps {
  stats: ThoughtStats | null;
}

export function StatsHeader({ stats }: StatsHeaderProps) {
  if (!stats) return null;

  const items = [
    { label: "Total Thoughts", value: stats.total },
    { label: "This Week", value: stats.thisWeek },
    { label: "Top Topic", value: stats.topTopic || "---" },
    { label: "Top Person", value: stats.topPerson || "---" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-bg-card p-3"
        >
          <div className="text-xs text-text-muted">{item.label}</div>
          <div className="mt-1 text-lg font-semibold text-text-primary">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
