-- Schema: Actions
-- Trackable work items extracted from thoughts or captured directly.

create table actions (
  id uuid primary key default gen_random_uuid(),
  thought_id uuid references thoughts(id) on delete set null,
  content text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  due_date date,
  completed_at timestamptz,
  completion_note text,
  blocked_by text,
  unblocks text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_actions_status on actions(status);
create index idx_actions_due_date on actions(due_date);
create index idx_actions_thought_id on actions(thought_id);

-- Auto-update updated_at
create or replace function update_actions_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger actions_updated_at
  before update on actions
  for each row execute function update_actions_timestamp();
