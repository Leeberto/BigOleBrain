-- Fix: Meal planning RLS policies cause 42P17 (infinite recursion)
--
-- The recipes, meal_plans, and shopping_lists SELECT policies reference
-- household_members, whose own SELECT policy is self-referential. This
-- triggers PostgreSQL's cross-table RLS recursion detector.
--
-- Fix: a SECURITY DEFINER function that resolves the caller's household_id
-- without going through household_members RLS. Policies then call this
-- function instead of subquerying household_members directly.

-- 1. Create the helper function
create or replace function public.get_my_household_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select household_id
  from public.household_members
  where user_id = auth.uid()
  limit 1;
$$;

-- 2. Drop the existing policies on recipes
drop policy if exists "recipes_select" on recipes;
drop policy if exists "recipes_insert" on recipes;
drop policy if exists "recipes_update" on recipes;
drop policy if exists "recipes_delete" on recipes;
-- Also drop the extension-era policies if they still exist
drop policy if exists "Users can CRUD their own recipes" on recipes;
drop policy if exists "Household members can view recipes" on recipes;

-- 3. Drop the existing policies on meal_plans
drop policy if exists "meal_plans_select" on meal_plans;
drop policy if exists "meal_plans_insert" on meal_plans;
drop policy if exists "meal_plans_update" on meal_plans;
drop policy if exists "meal_plans_delete" on meal_plans;
drop policy if exists "Users can CRUD their own meal plans" on meal_plans;
drop policy if exists "Household members can view meal plans" on meal_plans;

-- 4. Drop the existing policies on shopping_lists
drop policy if exists "shopping_lists_select" on shopping_lists;
drop policy if exists "shopping_lists_insert" on shopping_lists;
drop policy if exists "shopping_lists_update" on shopping_lists;
drop policy if exists "shopping_lists_delete" on shopping_lists;
drop policy if exists "Users can CRUD their own shopping lists" on shopping_lists;
drop policy if exists "Household members can view shopping lists" on shopping_lists;
drop policy if exists "Household members can update shopping lists" on shopping_lists;

-- 5. Recreate policies using get_my_household_id()

-- recipes
create policy "recipes_select" on recipes
  for select using (household_id = public.get_my_household_id());

create policy "recipes_insert" on recipes
  for insert with check (household_id = public.get_my_household_id());

create policy "recipes_update" on recipes
  for update
  using (household_id = public.get_my_household_id())
  with check (household_id = public.get_my_household_id());

create policy "recipes_delete" on recipes
  for delete using (
    household_id = public.get_my_household_id()
    and user_id = auth.uid()
  );

-- meal_plans
create policy "meal_plans_select" on meal_plans
  for select using (household_id = public.get_my_household_id());

create policy "meal_plans_insert" on meal_plans
  for insert with check (household_id = public.get_my_household_id());

create policy "meal_plans_update" on meal_plans
  for update
  using (household_id = public.get_my_household_id())
  with check (household_id = public.get_my_household_id());

create policy "meal_plans_delete" on meal_plans
  for delete using (
    household_id = public.get_my_household_id()
    and user_id = auth.uid()
  );

-- shopping_lists
create policy "shopping_lists_select" on shopping_lists
  for select using (household_id = public.get_my_household_id());

create policy "shopping_lists_insert" on shopping_lists
  for insert with check (household_id = public.get_my_household_id());

create policy "shopping_lists_update" on shopping_lists
  for update
  using (household_id = public.get_my_household_id())
  with check (household_id = public.get_my_household_id());

create policy "shopping_lists_delete" on shopping_lists
  for delete using (
    household_id = public.get_my_household_id()
    and user_id = auth.uid()
  );

-- 6. Notify PostgREST to reload its schema cache
notify pgrst, 'reload schema';
