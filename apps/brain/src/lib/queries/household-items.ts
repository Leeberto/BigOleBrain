import { createClient } from '@/lib/supabase/client'

export type HouseholdItem = {
  id: string
  user_id: string
  household_id: string
  name: string
  category: string | null
  location: string | null
  details: Record<string, string> | null
  notes: string | null
  created_at: string
  updated_at: string
}

export async function getItems(): Promise<HouseholdItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('household_items')
    .select('*')
    .order('category', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as HouseholdItem[]
}

export async function getItem(id: string): Promise<HouseholdItem> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('household_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as HouseholdItem
}

export async function createItem(
  item: Partial<HouseholdItem>,
  householdId: string,
): Promise<HouseholdItem> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('household_items')
    .insert({ ...item, household_id: householdId })
    .select()
    .single()

  if (error) throw error
  return data as HouseholdItem
}

export async function updateItem(
  id: string,
  updates: Partial<HouseholdItem>,
): Promise<HouseholdItem> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('household_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as HouseholdItem
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('household_items').delete().eq('id', id)
  if (error) throw error
}

export async function searchItems(query: string): Promise<HouseholdItem[]> {
  const supabase = createClient()
  const term = `%${query}%`
  const { data, error } = await supabase
    .from('household_items')
    .select('*')
    .or(`name.ilike.${term},category.ilike.${term},location.ilike.${term}`)
    .order('name', { ascending: true })
    .limit(50)

  if (error) throw error
  return (data ?? []) as HouseholdItem[]
}
