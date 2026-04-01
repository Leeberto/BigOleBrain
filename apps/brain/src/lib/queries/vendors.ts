import { createClient } from '@/lib/supabase/client'

export type Vendor = {
  id: string
  user_id: string
  household_id: string
  name: string
  service_type: string | null
  phone: string | null
  email: string | null
  website: string | null
  notes: string | null
  rating: number | null
  last_used: string | null
  created_at: string
}

export async function getVendors(serviceType?: string | null): Promise<Vendor[]> {
  const supabase = createClient()
  let query = supabase.from('household_vendors').select('*').order('name', { ascending: true })

  if (serviceType) {
    query = query.eq('service_type', serviceType)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Vendor[]
}

export async function getVendor(id: string): Promise<Vendor> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('household_vendors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Vendor
}

export async function createVendor(
  vendor: Partial<Vendor>,
  householdId: string,
): Promise<Vendor> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('household_vendors')
    .insert({ ...vendor, household_id: householdId })
    .select()
    .single()

  if (error) throw error
  return data as Vendor
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('household_vendors')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Vendor
}

export async function deleteVendor(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('household_vendors').delete().eq('id', id)
  if (error) throw error
}

export async function getServiceTypes(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('household_vendors')
    .select('service_type')
    .not('service_type', 'is', null)

  if (error) throw error
  const types = (data ?? [])
    .map((r: { service_type: string | null }) => r.service_type)
    .filter((t): t is string => Boolean(t))
  return Array.from(new Set(types)).sort()
}
