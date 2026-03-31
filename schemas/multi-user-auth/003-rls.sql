-- 003-rls.sql
-- Feature 2.1: Drop old RLS policies, create household-based policies
-- All existing tables already have RLS enabled; only new tables need it.

-- ──────────────────────────────────────────────
-- Enable RLS on new tables
-- ──────────────────────────────────────────────

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- Drop existing policies
-- ──────────────────────────────────────────────

-- Meal planning (has user_id + jwt role policies)
DROP POLICY IF EXISTS "Users can CRUD their own recipes" ON recipes;
DROP POLICY IF EXISTS "Household members can view recipes" ON recipes;
DROP POLICY IF EXISTS "Users can CRUD their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can view meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can CRUD their own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Household members can view shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Household members can update shopping lists" ON shopping_lists;

-- Home maintenance (has user_id-only policies)
DROP POLICY IF EXISTS maintenance_tasks_user_policy ON maintenance_tasks;
DROP POLICY IF EXISTS maintenance_logs_user_policy ON maintenance_logs;

-- Household knowledge (has user_id-only policies)
DROP POLICY IF EXISTS household_items_user_policy ON household_items;
DROP POLICY IF EXISTS household_vendors_user_policy ON household_vendors;

-- ──────────────────────────────────────────────
-- Households table policies
-- ──────────────────────────────────────────────

CREATE POLICY households_select ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY households_update ON households
  FOR UPDATE USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY households_delete ON households
  FOR DELETE USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ──────────────────────────────────────────────
-- Household members table policies
-- ──────────────────────────────────────────────

CREATE POLICY household_members_select ON household_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY household_members_insert ON household_members
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY household_members_update ON household_members
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY household_members_delete ON household_members
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ──────────────────────────────────────────────
-- Personal tables: own rows only
-- ──────────────────────────────────────────────

CREATE POLICY thoughts_user_policy ON thoughts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY actions_user_policy ON actions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Shared tables: household member access
-- Helper: membership subquery used in all shared-table policies
--   household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
-- ──────────────────────────────────────────────

-- ── Recipes ──

CREATE POLICY recipes_select ON recipes
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY recipes_insert ON recipes
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY recipes_update ON recipes
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY recipes_delete ON recipes
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Meal Plans ──

CREATE POLICY meal_plans_select ON meal_plans
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY meal_plans_insert ON meal_plans
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY meal_plans_update ON meal_plans
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY meal_plans_delete ON meal_plans
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Shopping Lists ──

CREATE POLICY shopping_lists_select ON shopping_lists
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY shopping_lists_insert ON shopping_lists
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY shopping_lists_update ON shopping_lists
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY shopping_lists_delete ON shopping_lists
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Family Members ──

CREATE POLICY family_members_select ON family_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY family_members_insert ON family_members
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY family_members_update ON family_members
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY family_members_delete ON family_members
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Activities ──

CREATE POLICY activities_select ON activities
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY activities_insert ON activities
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY activities_update ON activities
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY activities_delete ON activities
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Important Dates ──

CREATE POLICY important_dates_select ON important_dates
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY important_dates_insert ON important_dates
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY important_dates_update ON important_dates
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY important_dates_delete ON important_dates
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Maintenance Tasks ──

CREATE POLICY maintenance_tasks_select ON maintenance_tasks
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY maintenance_tasks_insert ON maintenance_tasks
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY maintenance_tasks_update ON maintenance_tasks
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY maintenance_tasks_delete ON maintenance_tasks
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Maintenance Logs ──

CREATE POLICY maintenance_logs_select ON maintenance_logs
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY maintenance_logs_insert ON maintenance_logs
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY maintenance_logs_update ON maintenance_logs
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY maintenance_logs_delete ON maintenance_logs
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Household Items ──

CREATE POLICY household_items_select ON household_items
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY household_items_insert ON household_items
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY household_items_update ON household_items
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY household_items_delete ON household_items
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ── Household Vendors ──

CREATE POLICY household_vendors_select ON household_vendors
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY household_vendors_insert ON household_vendors
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY household_vendors_update ON household_vendors
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY household_vendors_delete ON household_vendors
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
  );
