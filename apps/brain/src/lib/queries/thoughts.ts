import { createClient } from '@/lib/supabase/client'

export type ThoughtMetadata = {
  type?: string
  topics?: string[]
  people?: string[]
  sentiment?: string
  action_items?: string[]
  source?: string
}

export type Thought = {
  id: string
  content: string
  metadata: ThoughtMetadata | null
  created_at: string
  updated_at: string
  user_id: string | null
}

const PAGE_SIZE = 25

export async function getThoughts(opts?: {
  page?: number
  type?: string
  topic?: string
  person?: string
}): Promise<{ data: Thought[]; count: number }> {
  const supabase = createClient()
  const page = opts?.page ?? 0
  const offset = page * PAGE_SIZE

  let query = supabase
    .from('thoughts')
    .select('id, content, metadata, created_at, updated_at, user_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (opts?.type) {
    query = query.eq('metadata->>type', opts.type)
  }
  if (opts?.topic) {
    query = query.contains('metadata->topics', JSON.stringify([opts.topic]))
  }
  if (opts?.person) {
    query = query.contains('metadata->people', JSON.stringify([opts.person]))
  }

  const { data, count, error } = await query

  if (error) throw error
  return { data: (data ?? []) as Thought[], count: count ?? 0 }
}

export async function searchThoughts(query: string): Promise<Thought[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('thoughts')
    .select('id, content, metadata, created_at, updated_at, user_id')
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return (data ?? []) as Thought[]
}

export async function semanticSearchThoughts(query: string): Promise<Thought[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('match_thoughts', {
    query_text: query,
    match_threshold: 0.7,
    match_count: 20,
  })

  if (error) throw error
  return (data ?? []) as Thought[]
}

export async function deleteThought(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('thoughts').delete().eq('id', id)
  if (error) throw error
}

export async function getThoughtFilterOptions(): Promise<{
  types: string[]
  topics: string[]
  people: string[]
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('thoughts')
    .select('metadata')
    .order('created_at', { ascending: false })

  if (error) throw error

  const typeSet = new Set<string>()
  const topicSet = new Set<string>()
  const personSet = new Set<string>()

  for (const row of data ?? []) {
    const m = row.metadata as ThoughtMetadata | null
    if (m?.type) typeSet.add(m.type)
    if (m?.topics) m.topics.forEach((t) => topicSet.add(t))
    if (m?.people) m.people.forEach((p) => personSet.add(p))
  }

  return {
    types: Array.from(typeSet).sort(),
    topics: Array.from(topicSet).sort(),
    people: Array.from(personSet).sort(),
  }
}
