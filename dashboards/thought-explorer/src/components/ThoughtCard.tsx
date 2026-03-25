"use client";

import { useState } from "react";
import { Thought } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  observation: "bg-blue-500/20 text-blue-400",
  task: "bg-amber-500/20 text-amber-400",
  question: "bg-purple-500/20 text-purple-400",
  idea: "bg-green-500/20 text-green-400",
  decision: "bg-red-500/20 text-red-400",
  reflection: "bg-teal-500/20 text-teal-400",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ThoughtCardProps {
  thought: Thought;
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = thought.metadata;
  const type = meta?.type || "note";
  const topics = meta?.topics || [];
  const people = meta?.people || [];
  const isLong = thought.content.length > 280;

  return (
    <div
      className="rounded-lg border border-border bg-bg-card p-4 transition-colors hover:bg-bg-card-hover cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type] || "bg-gray-500/20 text-gray-400"}`}
            >
              {type}
            </span>
            {topics.slice(0, 3).map((t) => (
              <span
                key={t}
                className="inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent"
              >
                {t}
              </span>
            ))}
            {topics.length > 3 && (
              <span className="text-xs text-text-muted">
                +{topics.length - 3}
              </span>
            )}
          </div>

          <p className="text-sm text-text-primary leading-relaxed">
            {expanded || !isLong
              ? thought.content
              : thought.content.slice(0, 280) + "..."}
          </p>

          {people.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {people.map((p) => (
                <span
                  key={p}
                  className="text-xs text-text-muted"
                >
                  @{p}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-text-muted whitespace-nowrap">
          {formatDate(thought.created_at)}
        </div>
      </div>
    </div>
  );
}
