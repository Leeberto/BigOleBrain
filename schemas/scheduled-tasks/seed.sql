-- Seed data: Pre-built scheduled tasks
-- Safe to re-run — uses ON CONFLICT to skip existing rows.

insert into scheduled_tasks (name, description, enabled, trigger_type, cron_expression, task_type, prompt_template, gather_config, delivery_channel)
values (
  'morning-briefing',
  'Weekday morning prioritization — surfaces open actions, approaching due dates, and recent thoughts.',
  true,
  'cron',
  '0 7 * * 1-5',
  'llm_prompt',
  'You are a personal productivity assistant. Given the user''s open actions and recent thoughts below, produce a concise morning briefing:

1. **Top priorities** — actions due soonest or most important (max 5).
2. **Overdue** — anything past its due date.
3. **Recent context** — 2-3 notable thoughts from the last 24 hours that may inform today''s work.
4. **Suggested focus** — one sentence on what to tackle first and why.

Keep it short and actionable. No fluff.',
  '{"queries": [{"source": "actions", "filter": {"status": "open"}, "order": "due_date", "limit": 20}, {"source": "thoughts", "filter": {"days": 1}, "limit": 10}]}',
  'mcp_response'
) on conflict (name) do nothing;

insert into scheduled_tasks (name, description, enabled, trigger_type, cron_expression, task_type, prompt_template, gather_config, delivery_channel)
values (
  'weekly-review',
  'Sunday weekly review — summarizes completed actions, stale items, and emerging themes.',
  true,
  'cron',
  '0 9 * * 0',
  'llm_prompt',
  'You are a weekly review assistant. Given the user''s actions (completed and open) and thoughts from the past 7 days, produce a structured weekly review:

1. **Completed this week** — list actions marked done with their completion notes.
2. **Still open** — actions that carried over. Flag any that are overdue.
3. **Stale items** — actions open for 14+ days with no updates.
4. **Themes** — 2-3 recurring topics or patterns from this week''s thoughts.
5. **Recommendations** — suggest 1-2 actions to close, delegate, or cancel.

Be direct and specific.',
  '{"queries": [{"source": "actions", "filter": {"status": "open"}, "order": "due_date", "limit": 50}, {"source": "actions", "filter": {"status": "done", "days": 7}, "limit": 50}, {"source": "thoughts", "filter": {"days": 7}, "limit": 30}]}',
  'mcp_response'
) on conflict (name) do nothing;

insert into scheduled_tasks (name, description, enabled, trigger_type, cron_expression, task_type, gather_config, delivery_channel)
values (
  'stale-loop-scan',
  'Monday scan for stale actions and unanswered questions older than 14 days.',
  false,
  'cron',
  '0 9 * * 1',
  'stale_loop_scan',
  '{"queries": [{"source": "actions", "filter": {"status": "open", "older_than_days": 14}, "limit": 50}]}',
  'mcp_response'
) on conflict (name) do nothing;

insert into scheduled_tasks (name, description, enabled, trigger_type, cron_expression, task_type, gather_config, delivery_channel)
values (
  'alert-digest',
  'Daily scan of actions with approaching due dates (within 2 days).',
  false,
  'cron',
  '0 7 * * *',
  'alert_digest',
  '{"queries": [{"source": "actions", "filter": {"status": "open", "due_within_days": 2}, "order": "due_date", "limit": 20}]}',
  'mcp_response'
) on conflict (name) do nothing;

insert into scheduled_tasks (name, description, enabled, trigger_type, event_source, task_type, gather_config, delivery_channel)
values (
  'andrea-deck-prep',
  'Pre-populate Andrea deck before calendar events. Blocked on deck template.',
  false,
  'event',
  'google_calendar',
  'deck_builder',
  '{"queries": [{"source": "thoughts", "filter": {"days": 7}, "limit": 20}, {"source": "actions", "filter": {"status": "open"}, "limit": 20}]}',
  'email'
) on conflict (name) do nothing;

insert into scheduled_tasks (name, description, enabled, trigger_type, cron_expression, task_type, gather_config, delivery_channel)
values (
  'weekly-trends',
  'Compute topic velocity and sentiment shifts across the past week.',
  false,
  'cron',
  '0 9 * * 0',
  'trend_analysis',
  '{"queries": [{"source": "thoughts", "filter": {"days": 7}, "limit": 100}]}',
  'mcp_response'
) on conflict (name) do nothing;
