"use client";

interface TopicCluster {
  topic: string;
  count: number;
}

interface TopicClustersProps {
  clusters: TopicCluster[];
  activeTopic: string;
  onSelectTopic: (topic: string) => void;
}

export function TopicClusters({
  clusters,
  activeTopic,
  onSelectTopic,
}: TopicClustersProps) {
  if (!clusters.length) {
    return (
      <p className="text-sm text-text-muted">No topics found.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {clusters.map(({ topic, count }) => (
        <button
          key={topic}
          onClick={() =>
            onSelectTopic(activeTopic === topic ? "" : topic)
          }
          className={`rounded-lg border p-3 text-left transition-colors ${
            activeTopic === topic
              ? "border-accent bg-accent/10"
              : "border-border bg-bg-card hover:bg-bg-card-hover"
          }`}
        >
          <div className="text-sm font-medium text-text-primary truncate">
            {topic}
          </div>
          <div className="mt-1 text-xs text-text-muted">
            {count} thought{count !== 1 ? "s" : ""}
          </div>
        </button>
      ))}
    </div>
  );
}
