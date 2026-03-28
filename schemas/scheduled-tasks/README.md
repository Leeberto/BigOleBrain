# Scheduled Tasks Schema

General-purpose task engine for automated workflows: trigger → gather → execute → deliver. Part of Phase 1 (Close the loops), Feature 1.1d.

## Why

Morning briefings, weekly reviews, stale loop scans, alert digests — all follow the same shape. Rather than building each as a standalone Edge Function, this schema stores task definitions that a single task runner executes.

## Schema

### `scheduled_tasks`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text (unique) | Human-readable task identifier |
| `description` | text | What this task does |
| `enabled` | boolean | Whether the task runs on schedule |
| `trigger_type` | text | `cron`, `due_date`, `event`, or `manual` |
| `cron_expression` | text | Standard 5-field cron (for cron triggers) |
| `due_date_source` | text | Table to scan for approaching due dates |
| `due_date_lead_days` | int | Days before due date to fire |
| `event_source` | text | External event source (e.g. `google_calendar`) |
| `event_lead_hours` | int | Hours before event to fire |
| `gather_config` | jsonb | Defines what data to pull from the brain |
| `task_type` | text | `llm_prompt`, `alert_digest`, `deck_builder`, `stale_loop_scan`, or `trend_analysis` |
| `prompt_template` | text | System prompt for `llm_prompt` tasks |
| `deck_template_id` | text | Template reference for `deck_builder` tasks |
| `output_format` | text | `markdown`, `html`, `pptx`, or `json` |
| `delivery_channel` | text | `email`, `telegram`, `slack`, `file`, or `mcp_response` |
| `delivery_config` | jsonb | Channel-specific settings (recipients, etc.) |
| `last_run_at` | timestamptz | When the task last executed |
| `last_run_status` | text | Result of last execution |
| `created_at` | timestamptz | Auto-set on insert |
| `updated_at` | timestamptz | Auto-updated via trigger |

### `task_run_log`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `task_id` | uuid | References `scheduled_tasks(id)` |
| `started_at` | timestamptz | When execution began |
| `completed_at` | timestamptz | When execution finished |
| `status` | text | `running`, `success`, or `error` |
| `input_summary` | text | What data was gathered |
| `output_summary` | text | What was produced |
| `error_message` | text | Error details if failed |
| `delivery_status` | text | `sent`, `failed`, or `skipped` |

## Setup

1. Run `schema.sql` in your Supabase SQL Editor.
2. Run `seed.sql` to insert the 6 pre-built tasks.

## MCP Tools

Five tools are added via the `scheduled-tasks-mcp` Edge Function:

- `create_scheduled_task` — register a new task
- `update_scheduled_task` — update task configuration
- `list_scheduled_tasks` — show all tasks with last run status
- `run_task_now` — manually trigger any task
- `task_run_history` — view recent execution logs

## `gather_config` Format

```json
{
  "queries": [
    { "source": "actions", "filter": { "status": "open" }, "order": "due_date", "limit": 20 },
    { "source": "thoughts", "filter": { "days": 3 }, "limit": 10 }
  ]
}
```

Supported filters: `status`, `days` (recency), `tags`, `due_within_days`, `older_than_days`.

## Optional: pg_cron Setup

To run tasks on schedule automatically, enable the `pg_cron` extension (Supabase Pro plan) and schedule the task runner:

```sql
select cron.schedule(
  'run-scheduled-tasks',
  '*/15 * * * *',
  $$select net.http_post(
    url := '<your-supabase-url>/functions/v1/task-runner',
    headers := '{"Authorization": "Bearer <service-role-key>", "Content-Type": "application/json"}'::jsonb,
    body := '{"mode": "cron_sweep"}'::jsonb
  )$$
);
```
