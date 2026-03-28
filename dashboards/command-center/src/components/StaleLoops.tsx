"use client";

import { Action } from "@/lib/types";
import { ActionCard } from "./ActionCard";
import { AlertTriangle } from "lucide-react";

interface StaleLoopsProps {
  actions: Action[];
  onStatusChange: (id: string, status: string, note?: string) => Promise<void>;
  onSnooze: (id: string, days: number) => Promise<void>;
}

export function StaleLoops({ actions, onStatusChange, onSnooze }: StaleLoopsProps) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        <AlertTriangle className="h-4 w-4" />
        Stale Loops
      </h2>

      {actions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-bg-card px-4 py-8 text-center text-sm text-text-muted">
          No stale loops
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onStatusChange={onStatusChange}
              onSnooze={onSnooze}
              staleMode
            />
          ))}
        </div>
      )}
    </section>
  );
}
