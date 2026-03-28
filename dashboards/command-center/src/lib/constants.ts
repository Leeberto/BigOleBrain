export const STATUS_COLORS: Record<string, string> = {
  open: "bg-status-open",
  in_progress: "bg-status-in_progress",
  done: "bg-status-done",
  cancelled: "bg-status-cancelled",
};

export const STATUS_TEXT_COLORS: Record<string, string> = {
  open: "text-status-open",
  in_progress: "text-status-in_progress",
  done: "text-status-done",
  cancelled: "text-status-cancelled",
};

export const STATUS_BORDER_COLORS: Record<string, string> = {
  open: "border-status-open",
  in_progress: "border-status-in_progress",
  done: "border-status-done",
  cancelled: "border-status-cancelled",
};

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export const SOURCE_COLORS: Record<string, string> = {
  action: "#3b82f6",
  activity: "#a855f7",
  important_date: "#ef4444",
  maintenance: "#fb7185",
};

export const SOURCE_LABELS: Record<string, string> = {
  action: "Action",
  activity: "Activity",
  important_date: "Important Date",
  maintenance: "Maintenance",
};

export const STALE_THRESHOLD_DAYS = 14;
