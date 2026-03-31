-- 001-schema.sql
-- Feature 2.1: Multi-user auth — new tables + column additions
-- Safe to re-run: uses IF NOT EXISTS / IF NOT EXISTS patterns

-- ──────────────────────────────────────────────
-- New tables
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Home',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS household_members (
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  PRIMARY KEY (household_id, user_id)
);

-- ──────────────────────────────────────────────
-- Personal tables: add user_id
-- ──────────────────────────────────────────────

ALTER TABLE thoughts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE actions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ──────────────────────────────────────────────
-- Shared tables: add household_id
-- ──────────────────────────────────────────────

-- Meal planning
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

ALTER TABLE shopping_lists
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

-- Family calendar
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

ALTER TABLE important_dates
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

-- Home maintenance
ALTER TABLE maintenance_tasks
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

ALTER TABLE maintenance_logs
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

-- Household knowledge
ALTER TABLE household_items
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

ALTER TABLE household_vendors
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

-- ──────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_user_id ON actions(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);

CREATE INDEX IF NOT EXISTS idx_recipes_household ON recipes(household_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_household ON meal_plans(household_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_household ON shopping_lists(household_id);
CREATE INDEX IF NOT EXISTS idx_family_members_household ON family_members(household_id);
CREATE INDEX IF NOT EXISTS idx_activities_household ON activities(household_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_household ON important_dates(household_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_household ON maintenance_tasks(household_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_household ON maintenance_logs(household_id);
CREATE INDEX IF NOT EXISTS idx_household_items_household ON household_items(household_id);
CREATE INDEX IF NOT EXISTS idx_household_vendors_household ON household_vendors(household_id);
