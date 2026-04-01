-- 004-default-auth-uid.sql
-- Feature 2.1: Add DEFAULT auth.uid() to personal tables.
-- Safety net: inserts via anon-key + JWT client auto-populate user_id
-- even if application code omits it.

ALTER TABLE thoughts ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE actions  ALTER COLUMN user_id SET DEFAULT auth.uid();
