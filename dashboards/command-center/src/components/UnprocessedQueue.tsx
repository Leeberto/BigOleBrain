"use client";

import { Thought } from "@/lib/types";
import { ThoughtCard } from "./ThoughtCard";
import { Inbox, CheckCircle } from "lucide-react";

interface UnprocessedQueueProps {
  thoughts: Thought[];
  onConvert: (thoughtId: string, content: string, dueDate?: string) => Promise<void>;
}

export function UnprocessedQueue({ thoughts, onConvert }: UnprocessedQueueProps) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        <Inbox className="h-4 w-4" />
        Unprocessed Thoughts
      </h2>

      {thoughts.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-card px-4 py-8 text-sm text-text-muted">
          <CheckCircle className="h-4 w-4" />
          All caught up!
        </div>
      ) : (
        <div className="space-y-2">
          {thoughts.map((thought) => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              onConvert={onConvert}
            />
          ))}
        </div>
      )}
    </section>
  );
}
