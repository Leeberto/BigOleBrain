"use client";

import { useState } from "react";
import { HIDDEN_COLUMNS, PAGE_SIZE } from "@/lib/tables";

interface DataTableProps {
  tableName: string;
  data: Record<string, unknown>[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

function CellValue({ value }: { value: unknown }) {
  const [expanded, setExpanded] = useState(false);

  if (value === null || value === undefined) {
    return <span className="text-text-muted">&mdash;</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          value ? "bg-green-400" : "bg-red-400"
        }`}
      />
    );
  }

  if (typeof value === "object") {
    const json = JSON.stringify(value, null, 2);
    if (!expanded && json.length > 60) {
      return (
        <button
          onClick={() => setExpanded(true)}
          className="max-w-xs truncate text-left font-mono text-xs text-text-secondary hover:text-accent"
        >
          {JSON.stringify(value)}
        </button>
      );
    }
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-left"
      >
        <pre className="max-w-sm whitespace-pre-wrap font-mono text-xs text-text-secondary">
          {json}
        </pre>
      </button>
    );
  }

  const str = String(value);

  // Date detection (ISO 8601 patterns)
  if (/^\d{4}-\d{2}-\d{2}(T|\s)/.test(str)) {
    try {
      const d = new Date(str);
      return (
        <span className="text-text-secondary">
          {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      );
    } catch {
      // fall through
    }
  }

  if (str.length > 80 && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="max-w-xs text-left text-text-primary hover:text-accent"
      >
        {str.slice(0, 80)}&hellip;
      </button>
    );
  }

  if (expanded) {
    return (
      <button
        onClick={() => setExpanded(false)}
        className="max-w-sm text-left whitespace-pre-wrap text-text-primary"
      >
        {str}
      </button>
    );
  }

  return <span className="text-text-primary">{str}</span>;
}

export function DataTable({
  tableName,
  data,
  totalCount,
  page,
  onPageChange,
  loading,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        Loading {tableName}...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        No rows in {tableName}
      </div>
    );
  }

  const columns = Object.keys(data[0]).filter(
    (col) => !HIDDEN_COLUMNS.includes(col)
  );
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-secondary">
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-3 py-2 text-left font-medium text-text-secondary"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/50 transition-colors hover:bg-bg-card-hover"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="whitespace-nowrap px-3 py-2 align-top"
                  >
                    <CellValue value={row[col]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>
          {totalCount} row{totalCount !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="rounded border border-border px-3 py-1 text-text-secondary transition-colors hover:bg-bg-card disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-text-secondary">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page + 1 >= totalPages}
            className="rounded border border-border px-3 py-1 text-text-secondary transition-colors hover:bg-bg-card disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
