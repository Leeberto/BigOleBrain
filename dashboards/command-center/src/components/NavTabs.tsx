"use client";

export type View = "today" | "upcoming" | "thoughts";

interface NavTabsProps {
  view: View;
  onViewChange: (view: View) => void;
}

const TABS: { key: View; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "thoughts", label: "Thoughts" },
];

export function NavTabs({ view, onViewChange }: NavTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border pb-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onViewChange(tab.key)}
          className={`px-3 py-1.5 text-sm rounded-t transition-colors ${
            view === tab.key
              ? "bg-bg-card text-accent border border-border border-b-0"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
