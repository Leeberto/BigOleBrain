"use client";

import { useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(raw: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(raw), 300);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Search thoughts..."
      className="w-full max-w-xs rounded border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
    />
  );
}
