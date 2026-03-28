"use client";

import { useState } from "react";
import { Action } from "@/lib/types";
import {
  STATUS_BORDER_COLORS,
  STATUS_LABELS,
  STATUS_TEXT_COLORS,
} from "@/lib/constants";
import { cn, formatDate, daysUntil, daysAgoLabel } from "@/lib/utils";
import { Play, Check, X, Clock, Zap, RefreshCw } from "lucide-react";

interface ActionCardProps {
  action: Action;
  onStatusChange: (id: string, status: string, note?: string) => Promise<void>;
  onSnooze?: (id: string, days: number) => Promise<void>;
  staleMode?: boolean;
}

export function ActionCard({
  action,
  onStatusChange,
  onSnooze,
  staleMode,
}: ActionCardProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const borderColor =
    STATUS_BORDER_COLORS[action.status] ?? "border-text-muted";
  const days = action.due_date ? daysUntil(action.due_date) : null;

  async function handleStatusChange(status: string, completionNote?: string) {
    setBusy(true);
    try {
      await onStatusChange(action.id, status, completionNote);
    } finally {
      setBusy(false);
      setShowNoteInput(false);
      setNote("");
    }
  }

  return (
    <div
      className={cn(
        "border-l-[3px] rounded-lg bg-bg-card px-4 py-3 transition-colors hover:bg-bg-card-hover",
        borderColor
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="font-medium text-text-primary text-sm leading-snug">
            {action.content}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium bg-opacity-15",
            STATUS_TEXT_COLORS[action.status]
          )}
        >
          {STATUS_LABELS[action.status]}
        </span>
      </div>

      {/* Meta row */}
      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
        {action.due_date && (
          <span>
            Due {formatDate(action.due_date)}
            {days !== null && (
              <span
                className={cn(
                  "ml-1",
                  days < 0 ? "text-red-400" : "text-text-secondary"
                )}
              >
                ({daysAgoLabel(days)})
              </span>
            )}
          </span>
        )}
        {action.recurrence && (
          <span className="flex items-center gap-0.5 text-accent">
            <RefreshCw className="h-3 w-3" />
            {action.recurrence}
          </span>
        )}
        {action.tags.length > 0 &&
          action.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-secondary"
            >
              {tag}
            </span>
          ))}
      </div>

      {/* Completion note input */}
      {showNoteInput && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Completion note..."
            className="flex-1 rounded border border-border bg-bg-secondary px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && note.trim()) {
                handleStatusChange("done", note.trim());
              }
              if (e.key === "Escape") {
                setShowNoteInput(false);
                setNote("");
              }
            }}
          />
          <button
            onClick={() => note.trim() && handleStatusChange("done", note.trim())}
            disabled={!note.trim() || busy}
            className="rounded bg-status-done px-2 py-1 text-[10px] font-medium text-white disabled:opacity-50"
          >
            Done
          </button>
          <button
            onClick={() => {
              setShowNoteInput(false);
              setNote("");
            }}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Action buttons */}
      {!showNoteInput && action.status !== "done" && action.status !== "cancelled" && (
        <div className="mt-2 flex items-center gap-2">
          {action.status === "open" && (
            <button
              onClick={() => handleStatusChange("in_progress")}
              disabled={busy}
              className="flex items-center gap-1 rounded bg-bg-secondary px-2 py-1 text-[10px] text-text-secondary hover:text-status-in_progress transition-colors disabled:opacity-50"
            >
              <Play className="h-3 w-3" />
              Start
            </button>
          )}
          <button
            onClick={() => setShowNoteInput(true)}
            disabled={busy}
            className="flex items-center gap-1 rounded bg-bg-secondary px-2 py-1 text-[10px] text-text-secondary hover:text-status-done transition-colors disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            Complete
          </button>
          <button
            onClick={() => handleStatusChange("cancelled")}
            disabled={busy}
            className="flex items-center gap-1 rounded bg-bg-secondary px-2 py-1 text-[10px] text-text-secondary hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          {/* Stale loop buttons */}
          {staleMode && onSnooze && (
            <>
              <button
                onClick={() => onSnooze(action.id, 7)}
                disabled={busy}
                className="flex items-center gap-1 rounded bg-bg-secondary px-2 py-1 text-[10px] text-text-secondary hover:text-accent transition-colors disabled:opacity-50"
              >
                <Clock className="h-3 w-3" />
                Snooze 7d
              </button>
              <button
                onClick={() => handleStatusChange("in_progress")}
                disabled={busy}
                className="flex items-center gap-1 rounded bg-bg-secondary px-2 py-1 text-[10px] text-text-secondary hover:text-status-in_progress transition-colors disabled:opacity-50"
              >
                <Zap className="h-3 w-3" />
                Do Now
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
