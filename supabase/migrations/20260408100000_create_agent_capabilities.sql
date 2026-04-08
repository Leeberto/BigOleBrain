-- Feature 5.2: Routing Agent — capability registry table

create table agent_capabilities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  handler_type text not null check (handler_type in ('edge_function', 'mcp_tool', 'external_api')),
  handler_config jsonb not null,
  required_integrations text[] default '{}',
  enabled boolean default true,
  created_at timestamptz default now()
);

-- Seed initial capabilities
insert into agent_capabilities (name, description, handler_type, handler_config, required_integrations) values
  ('web_research', 'Search the web and summarize findings on a topic', 'edge_function', '{"function": "research-agent"}', '{}'),
  ('email_draft', 'Draft an email based on context and intent', 'edge_function', '{"function": "email-agent"}', '{gmail}'),
  ('deck_builder', 'Build a presentation deck from gathered context', 'edge_function', '{"function": "deck-agent"}', '{}'),
  ('summarize', 'Summarize information from thoughts and actions', 'edge_function', '{"function": "summarize-agent"}', '{}'),
  ('alert_notify', 'Send a notification or reminder', 'edge_function', '{"function": "notify-agent"}', '{email}');

-- Add routing_scan to the scheduled_tasks task_type check constraint
alter table scheduled_tasks drop constraint scheduled_tasks_task_type_check;
alter table scheduled_tasks add constraint scheduled_tasks_task_type_check
  check (task_type = any (array['llm_prompt', 'alert_digest', 'deck_builder', 'stale_loop_scan', 'trend_analysis', 'triage_scan', 'routing_scan']));
