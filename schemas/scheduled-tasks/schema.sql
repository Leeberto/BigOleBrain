-- Schema: Scheduled Tasks
-- General-purpose task engine for trigger → gather → execute → deliver workflows.

create table scheduled_tasks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  enabled boolean default true,

  -- Trigger configuration
  trigger_type text not null check (trigger_type in ('cron', 'due_date', 'event', 'manual')),
  cron_expression text,                    -- for cron triggers: '0 7 * * *'
  due_date_source text,                    -- for due_date triggers: 'actions', 'important_dates', 'maintenance_tasks'
  due_date_lead_days int default 1,        -- how many days before due_date to fire
  event_source text,                       -- for event triggers: 'google_calendar'
  event_lead_hours int default 2,          -- how many hours before event to fire

  -- Data gathering configuration (what to pull from the brain)
  gather_config jsonb not null default '{}',

  -- Execution configuration (what to do with the gathered data)
  task_type text not null check (task_type in (
    'llm_prompt',        -- send gathered data to LLM with a prompt template
    'alert_digest',      -- format as notification digest
    'deck_builder',      -- generate a slide deck from template
    'stale_loop_scan',   -- specialized: find stale actions/questions
    'trend_analysis'     -- specialized: compute weekly metrics
  )),
  prompt_template text,            -- for llm_prompt: the system prompt to use
  deck_template_id text,           -- for deck_builder: reference to a template config
  output_format text default 'markdown' check (output_format in ('markdown', 'html', 'pptx', 'json')),

  -- Delivery configuration
  delivery_channel text not null default 'email' check (delivery_channel in ('email', 'telegram', 'slack', 'file', 'mcp_response')),
  delivery_config jsonb default '{}',

  -- Metadata
  last_run_at timestamptz,
  last_run_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table task_run_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references scheduled_tasks(id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running', 'success', 'error')),
  input_summary text,       -- what data was gathered
  output_summary text,      -- what was produced
  error_message text,
  delivery_status text       -- 'sent', 'failed', 'skipped'
);

create index idx_task_runs_task_id on task_run_log(task_id);
create index idx_scheduled_tasks_trigger on scheduled_tasks(trigger_type) where enabled = true;

-- Auto-update updated_at
create or replace function update_scheduled_tasks_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger scheduled_tasks_updated_at
  before update on scheduled_tasks
  for each row execute function update_scheduled_tasks_timestamp();
