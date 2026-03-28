"use client";

import { Zap } from "lucide-react";

export function Header() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-secondary px-6 py-3">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-accent" />
        <h1 className="text-lg font-semibold text-text-primary">
          Command Center
        </h1>
      </div>
      <span className="text-sm text-text-muted">{today}</span>
    </header>
  );
}
