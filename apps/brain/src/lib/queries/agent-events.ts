import { createClient } from '@/lib/supabase/client'

export type AgentActivityItem = {
  id: string
  title: string
  summary: string
  status: 'new' | 'complete' | 'needs_review' | 'info'
  created_at: string
}

function mapAgentStatus(agentStatus: string | null, actionStatus: string): AgentActivityItem['status'] {
  if (agentStatus === 'needs_review') return 'needs_review'
  if (agentStatus === 'agent_working') return 'new'
  if (actionStatus === 'done') return 'complete'
  return 'info'
}

function buildSummary(row: Record<string, unknown>): string {
  const parts: string[] = []
  if (row.agent_capability) parts.push(String(row.agent_capability))
  if (row.agent_status === 'handed_back') parts.push('Handed to human')
  else if (row.agent_status === 'agent_working') parts.push('Agent working')
  else if (row.agent_status === 'needs_review') parts.push('Awaiting review')
  if (row.agent_error) parts.push('Error occurred')
  return parts.join(' · ') || 'Agent activity'
}

export async function getRecentAgentActivity(limit: number = 5): Promise<AgentActivityItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('actions')
    .select('id, content, status, agent_status, agent_capability, agent_error, created_at, updated_at')
    .not('agent_status', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  if (!data?.length) return []

  return data.map((row) => ({
    id: row.id,
    title: row.content,
    summary: buildSummary(row),
    status: mapAgentStatus(row.agent_status, row.status),
    created_at: row.updated_at ?? row.created_at,
  }))
}
