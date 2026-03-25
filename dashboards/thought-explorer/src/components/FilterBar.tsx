"use client";

interface FilterBarProps {
  type: string;
  topic: string;
  person: string;
  onTypeChange: (v: string) => void;
  onTopicChange: (v: string) => void;
  onPersonChange: (v: string) => void;
  types: string[];
  topics: string[];
  people: string[];
}

export function FilterBar({
  type,
  topic,
  person,
  onTypeChange,
  onTopicChange,
  onPersonChange,
  types,
  topics,
  people,
}: FilterBarProps) {
  const selectClass =
    "rounded border border-border bg-bg-secondary px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All types</option>
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={topic}
        onChange={(e) => onTopicChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All topics</option>
        {topics.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={person}
        onChange={(e) => onPersonChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All people</option>
        {people.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
