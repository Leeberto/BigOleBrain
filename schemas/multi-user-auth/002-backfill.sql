-- 002-backfill.sql
-- Feature 2.1: Backfill existing rows + set NOT NULL constraints
--
-- INSTRUCTIONS:
--   1. Create Auth users for Lee and Liv in the Supabase dashboard
--   2. Replace the three UUIDs below with real values
--   3. Run this file in the Supabase SQL Editor

DO $$
DECLARE
  -- !! REPLACE THESE WITH REAL VALUES !!
  lee_id  UUID := '37e99ece-73b7-43df-9106-a60fc797a18b';  -- Lee's auth.users id
  liv_id  UUID := '82774138-4b1e-4822-99f9-da21f729e0b2';  -- Liv's auth.users id
  hh_id   UUID := gen_random_uuid();                        -- auto-generated household id
BEGIN

  -- ────────────────────────────────────────────
  -- 1. Create household + memberships
  -- ────────────────────────────────────────────

  INSERT INTO households (id, name) VALUES (hh_id, 'Home')
    ON CONFLICT (id) DO NOTHING;

  INSERT INTO household_members (household_id, user_id, role)
  VALUES
    (hh_id, lee_id, 'owner'),
    (hh_id, liv_id, 'member')
  ON CONFLICT (household_id, user_id) DO NOTHING;

  -- ────────────────────────────────────────────
  -- 2. Backfill personal tables (Lee owns all existing rows)
  -- ────────────────────────────────────────────

  UPDATE thoughts SET user_id = lee_id WHERE user_id IS NULL;
  UPDATE actions  SET user_id = lee_id WHERE user_id IS NULL;

  -- ────────────────────────────────────────────
  -- 3. Backfill shared tables with household_id
  -- ────────────────────────────────────────────

  -- Meal planning
  UPDATE recipes        SET household_id = hh_id WHERE household_id IS NULL;
  UPDATE meal_plans     SET household_id = hh_id WHERE household_id IS NULL;
  UPDATE shopping_lists SET household_id = hh_id WHERE household_id IS NULL;

  -- Family calendar
  UPDATE family_members SET household_id = hh_id WHERE household_id IS NULL;
  UPDATE activities     SET household_id = hh_id WHERE household_id IS NULL;
  UPDATE important_dates SET household_id = hh_id WHERE household_id IS NULL;

  -- Home maintenance
  UPDATE maintenance_tasks SET household_id = hh_id WHERE household_id IS NULL;
  UPDATE maintenance_logs  SET household_id = hh_id WHERE household_id IS NULL;

  -- Household knowledge
  UPDATE household_items   SET household_id = hh_id WHERE household_id IS NULL;
  UPDATE household_vendors SET household_id = hh_id WHERE household_id IS NULL;

  RAISE NOTICE 'Backfill complete. Household ID: %', hh_id;

END $$;

-- ────────────────────────────────────────────
-- 4. Set NOT NULL constraints
-- ────────────────────────────────────────────

-- Personal tables
ALTER TABLE thoughts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE actions  ALTER COLUMN user_id SET NOT NULL;

-- Shared tables
ALTER TABLE recipes           ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE meal_plans        ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE shopping_lists    ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE family_members    ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE activities        ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE important_dates   ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE maintenance_tasks ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE maintenance_logs  ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE household_items   ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE household_vendors ALTER COLUMN household_id SET NOT NULL;
