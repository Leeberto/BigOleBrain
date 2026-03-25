"use client";

import { useState } from "react";
import { TABLE_GROUPS } from "@/lib/tables";

interface TableNavProps {
  activeTable: string;
  onSelect: (tableKey: string) => void;
}

export function TableNav({ activeTable, onSelect }: TableNavProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggle(groupName: string) {
    setCollapsed((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  }

  return (
    <nav className="w-56 shrink-0 border-r border-border bg-bg-secondary p-4">
      <h2 className="mb-4 text-sm font-semibold text-text-primary">Tables</h2>
      <ul className="space-y-1">
        {TABLE_GROUPS.map((group) => (
          <li key={group.name}>
            <button
              onClick={() => toggle(group.name)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-text-secondary hover:bg-bg-card-hover"
            >
              <span>{group.icon}</span>
              <span>{group.name}</span>
              <span className="ml-auto text-xs text-text-muted">
                {collapsed[group.name] ? "+" : "\u2013"}
              </span>
            </button>
            {!collapsed[group.name] && (
              <ul className="ml-6 mt-0.5 space-y-0.5">
                {group.tables.map((table) => (
                  <li key={table.key}>
                    <button
                      onClick={() => onSelect(table.key)}
                      className={`w-full rounded px-2 py-1 text-left text-sm transition-colors ${
                        activeTable === table.key
                          ? "bg-accent/20 text-accent-hover"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      {table.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
