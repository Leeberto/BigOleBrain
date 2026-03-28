"use client";

import { useState } from "react";
import { Thought } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ThoughtCardProps {
  thought: Thought;
  onConvert: (thoughtId: string, content: string, dueDate?: string) => Promise<void>;
}

export function ThoughtCard({ thought, onConvert }: ThoughtCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState(thought.content.slice(0, 200));
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [converted, setConverted] = useState(false);

  async function handleConvert() {
    if (!content.trim() || busy) return;
    setBusy(true);
    try {
      await onConvert(thought.id, content.trim(), dueDate || undefined);
      setConverted(true);
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  }

  const meta = thought.metadata;
  const typeBadge = meta?.type;
  const topics = meta?.topics ?? [];

  return (
    <div className="rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:bg-bg-card-hover">
      {/* Content */}
      <p className="text-sm text-text-primary leading-relaxed line-clamp-3">
        {thought.content}
      </p>

      {/* Metadata badges */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-text-muted">{formatDate(thought.created_at)}</span>
        {typeBadge && (
          <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">
            {typeBadge}
          </span>
        )}
        {topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-secondary"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Convert to action */}
      {!converted && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-2 flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <ArrowRight className="h-3 w-3" />
          Action
        </button>
      )}

      {converted && (
        <div className="mt-2 text-xs text-status-done">
          Converted to action
        </div>
      )}

      {/* Inline convert form */}
      {showForm && (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded border border-border bg-bg-secondary px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded border border-border bg-bg-secondary px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
            />
            <button
              onClick={handleConvert}
              disabled={!content.trim() || busy}
              className="rounded bg-accent px-2 py-1 text-[10px] font-medium text-white disabled:opacity-50"
            >
              {busy ? "..." : "Create Action"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-text-muted hover:text-text-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
