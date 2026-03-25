export interface ThoughtMetadata {
  type?: string;
  topics?: string[];
  people?: string[];
  sentiment?: string;
  action_items?: string[];
  dates_mentioned?: string[];
  source?: string;
}

export interface Thought {
  id: string;
  content: string;
  metadata: ThoughtMetadata | null;
  created_at: string;
  updated_at: string;
}

export interface ThoughtStats {
  total: number;
  thisWeek: number;
  topTopic: string | null;
  topPerson: string | null;
}
