import { createClient } from '@/lib/supabase/client'

export type MaintenanceTask = {
  id: string
  user_id: string
  household_id: string
  name: string
  category: string | null
  frequency_days: number | null
  last_completed: string | null
  next_due: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes: string | null
  created_at: string
  updated_at: string
}

export type MaintenanceLog = {
  id: string
  task_id: string
  user_id: string
  household_id: string
  completed_at: string
  performed_by: string | null
  cost: number | null
  notes: string | null
  next_action: string | null
}

export type MaintenanceLogEntry = {
  completed_at?: string
  performed_by?: string
  cost?: number
  notes?: string
  next_action?: string
}

export async function getTasks(): Promise<MaintenanceTask[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*')
    .order('next_due', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data ?? []) as MaintenanceTask[]
}

export async function getTask(id: string): Promise<MaintenanceTask> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as MaintenanceTask
}

export async function createTask(
  task: Partial<MaintenanceTask>,
  householdId: string,
): Promise<MaintenanceTask> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .insert({ ...task, household_id: householdId })
    .select()
    .single()

  if (error) throw error
  return data as MaintenanceTask
}

export async function updateTask(
  id: string,
  updates: Partial<MaintenanceTask>,
): Promise<MaintenanceTask> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as MaintenanceTask
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient()
  // ON DELETE CASCADE handles maintenance_logs rows automatically
  const { error } = await supabase.from('maintenance_tasks').delete().eq('id', id)
  if (error) throw error
}

export async function logCompletion(
  taskId: string,
  entry: MaintenanceLogEntry,
  householdId: string,
): Promise<void> {
  const supabase = createClient()
  // Backend trigger (update_task_after_log) automatically updates
  // last_completed and recalculates next_due on the parent task.
  const { error } = await supabase.from('maintenance_logs').insert({
    task_id: taskId,
    household_id: householdId,
    completed_at: entry.completed_at ?? new Date().toISOString(),
    performed_by: entry.performed_by ?? null,
    cost: entry.cost ?? null,
    notes: entry.notes ?? null,
    next_action: entry.next_action ?? null,
  })

  if (error) throw error
}

export async function getHistory(taskId: string): Promise<MaintenanceLog[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('task_id', taskId)
    .order('completed_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as MaintenanceLog[]
}
