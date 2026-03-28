"use client";

import { Action, Thought } from "@/lib/types";
import { ActionCard } from "./ActionCard";
import { UnprocessedQueue } from "./UnprocessedQueue";
import { StaleLoops } from "./StaleLoops";
import { formatDate, daysUntil } from "@/lib/utils";
import { AlertCircle, CalendarDays, CalendarClock } from "lucide-react";

interface TodayViewProps {
  overdue: Action[];
  dueToday: Action[];
  thisWeek: Action[];
  unprocessed: Thought[];
  stale: Action[];
  onStatusChange: (id: string, status: string, note?: string) => Promise<void>;
  onSnooze: (id: string, days: number) => Promise<void>;
  onConvert: (thoughtId: string, content: string, dueDate?: string) => Promise<void>;
}

export function TodayView({
  overdue,
  dueToday,
  thisWeek,
  unprocessed,
  stale,
  onStatusChange,
  onSnooze,
  onConvert,
}: TodayViewProps) {
  // Group this-week actions by day
  const weekByDay: Record<string, Action[]> = {};
  for (const a of thisWeek) {
    if (a.due_date) {
      if (!weekByDay[a.due_date]) weekByDay[a.due_date] = [];
      weekByDay[a.due_date].push(a);
    }
  }
  const sortedDays = Object.keys(weekByDay).sort();

  return (
    <div className="space-y-6">
      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-400">
            <AlertCircle className="h-4 w-4" />
            Overdue ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Due Today */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          <CalendarDays className="h-4 w-4" />
          Due Today
        </h2>
        {dueToday.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-bg-card px-4 py-8 text-center text-sm text-text-muted">
            Nothing due today
          </div>
        ) : (
          <div className="space-y-2">
            {dueToday.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* This Week */}
      {thisWeek.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            <CalendarClock className="h-4 w-4" />
            This Week
          </h2>
          <div className="space-y-4">
            {sortedDays.map((day) => (
              <div key={day}>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-medium text-text-muted">
                  {formatDate(day)}
                  <span className="text-text-muted">
                    ({daysUntil(day) === 1 ? "tomorrow" : `in ${daysUntil(day)} days`})
                  </span>
                </h3>
                <div className="space-y-2">
                  {weekByDay[day].map((action) => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Unprocessed thoughts */}
      <UnprocessedQueue thoughts={unprocessed} onConvert={onConvert} />

      {/* Stale loops */}
      <StaleLoops
        actions={stale}
        onStatusChange={onStatusChange}
        onSnooze={onSnooze}
      />
    </div>
  );
}
