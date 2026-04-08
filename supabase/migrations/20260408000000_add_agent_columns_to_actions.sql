-- Feature 5.1: Triage Agent — add agent pipeline columns to actions table

alter table actions add column assigned_to text not null default 'human'
  check (assigned_to in ('human', 'triage-agent', 'routing-agent', 'agent'));

alter table actions add column agent_capability text;

alter table actions add column agent_status text
  check (agent_status in ('pending_triage', 'pending_routing', 'agent_working', 'needs_review', 'handed_back'));

-- Prevent duplicate triage-created actions for the same thought
create unique index idx_actions_one_per_triage_thought
  on actions (thought_id)
  where thought_id is not null and tags @> '{source:triage-agent}';

-- Add triage_scan to the scheduled_tasks task_type check constraint
alter table scheduled_tasks drop constraint scheduled_tasks_task_type_check;
alter table scheduled_tasks add constraint scheduled_tasks_task_type_check
  check (task_type = any (array['llm_prompt', 'alert_digest', 'deck_builder', 'stale_loop_scan', 'trend_analysis', 'triage_scan']));
