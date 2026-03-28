export interface Action {
  id: string;
  thought_id: string | null;
  content: string;
  status: "open" | "in_progress" | "done" | "cancelled";
  due_date: string | null;
  completed_at: string | null;
  completion_note: string | null;
  blocked_by: string | null;
  unblocks: string | null;
  tags: string[];
  recurrence: "daily" | "weekly" | "monthly" | null;
  recurrence_source_id: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface CalendarItem {
  id: string;
  source: "action" | "activity" | "important_date" | "maintenance";
  title: string;
  date: string; // YYYY-MM-DD
  status?: string;
  color: string;
}

export interface CommandCenterStats {
  openActions: number;
  overdueActions: number;
  thoughtsThisWeek: number;
  staleLoops: number;
}
