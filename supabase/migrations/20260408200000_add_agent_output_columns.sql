-- Feature 5.3: Verification loop — agent output storage

alter table actions add column agent_output text;
alter table actions add column agent_error text;
alter table actions add column agent_completed_at timestamptz;
