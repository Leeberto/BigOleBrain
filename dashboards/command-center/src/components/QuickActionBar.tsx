"use client";

import { useState } from "react";
import { MessageSquare, ListTodo } from "lucide-react";

interface QuickActionBarProps {
  onCapture: () => void;
}

export function QuickActionBar({ onCapture }: QuickActionBarProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"thought" | "action">("thought");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || submitting) return;

    setSubmitting(true);
    try {
      if (mode === "thought") {
        await fetch("/api/thoughts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: input.trim() }),
        });
      } else {
        await fetch("/api/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: input.trim() }),
        });
      }
      setInput("");
      onCapture();
    } catch {
      // silently fail for now
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMode(mode === "thought" ? "action" : "thought")}
        className="flex items-center gap-1 rounded border border-border bg-bg-secondary px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        title={`Mode: ${mode}`}
      >
        {mode === "thought" ? (
          <>
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Thought</span>
          </>
        ) : (
          <>
            <ListTodo className="h-3.5 w-3.5" />
            <span>Action</span>
          </>
        )}
      </button>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          mode === "thought"
            ? "Capture a thought..."
            : "Create an action..."
        }
        className="flex-1 rounded border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
      />
      <button
        type="submit"
        disabled={!input.trim() || submitting}
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {submitting ? "..." : "Add"}
      </button>
    </form>
  );
}
