'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatRow } from '@/components/shared/StatRow'
import { DetailPanel } from '@/components/shared/DetailPanel'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ThoughtCard } from '@/components/thoughts/ThoughtCard'
import { ThoughtDetail } from '@/components/thoughts/ThoughtDetail'
import { ThoughtSearch } from '@/components/thoughts/ThoughtSearch'
import {
  getThoughts,
  searchThoughts,
  deleteThought,
  getThoughtFilterOptions,
  type Thought,
} from '@/lib/queries/thoughts'

const PAGE_SIZE = 25

type FilterOptions = {
  types: string[]
  topics: string[]
  people: string[]
}

function FilterPills({
  label,
  options,
  active,
  onChange,
}: {
  label: string
  options: string[]
  active: string | null
  onChange: (v: string | null) => void
}) {
  if (options.length === 0) return null
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onChange(null)}
          className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
            active === null
              ? 'bg-blue-600 text-white dark:bg-blue-500'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(active === opt ? null : opt)}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-medium capitalize ${
              active === opt
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ThoughtsPage() {
  const { isOwner } = useAuth()

  // Feed state
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter options (loaded once)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    types: [],
    topics: [],
    people: [],
  })
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [activePerson, setActivePerson] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Thought[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Panel + delete state
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Stats derived from totalCount + filter options
  const [thisWeekCount, setThisWeekCount] = useState(0)
  const [topTopic, setTopTopic] = useState<string | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadThoughts = useCallback(
    async (pg: number, type: string | null, topic: string | null, person: string | null) => {
      if (pg === 0) setLoading(true)
      else setLoadingMore(true)
      setError(null)
      try {
        const { data, count } = await getThoughts({
          page: pg,
          type: type ?? undefined,
          topic: topic ?? undefined,
          person: person ?? undefined,
        })
        if (pg === 0) {
          setThoughts(data)
        } else {
          setThoughts((prev) => [...prev, ...data])
        }
        setTotalCount(count)
        setPage(pg)
      } catch {
        setError('Failed to load thoughts.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [],
  )

  const loadFilterOptions = useCallback(async () => {
    try {
      const opts = await getThoughtFilterOptions()
      setFilterOptions(opts)
      setTopTopic(opts.topics[0] ?? null)
    } catch {
      // non-critical
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadThoughts(0, activeType, activeTopic, activePerson)
    loadFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reload when filters change
  useEffect(() => {
    loadThoughts(0, activeType, activeTopic, activePerson)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, activeTopic, activePerson])

  // Calculate this-week count from loaded thoughts
  useEffect(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    setThisWeekCount(thoughts.filter((t) => new Date(t.created_at) >= weekAgo).length)
  }, [thoughts])

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }
    setSearchLoading(true)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchThoughts(searchQuery.trim())
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)
  }, [searchQuery])

  function handleFilterChange(
    field: 'type' | 'topic' | 'person',
    value: string | null,
  ) {
    setSearchQuery('')
    setSearchResults(null)
    if (field === 'type') setActiveType(value)
    if (field === 'topic') setActiveTopic(value)
    if (field === 'person') setActivePerson(value)
  }

  function openDetail(thought: Thought) {
    setSelectedThought(thought)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setSelectedThought(null)
    setShowDeleteConfirm(false)
  }

  async function handleDelete() {
    if (!selectedThought) return
    await deleteThought(selectedThought.id)
    closePanel()
    await loadThoughts(0, activeType, activeTopic, activePerson)
    await loadFilterOptions()
  }

  function handleLoadMore() {
    loadThoughts(page + 1, activeType, activeTopic, activePerson)
  }

  const isSearching = searchQuery.trim().length > 0
  const displayList = isSearching ? (searchResults ?? []) : thoughts
  const hasMore = !isSearching && thoughts.length < totalCount

  const panelTitle = selectedThought
    ? selectedThought.content.slice(0, 40) + (selectedThought.content.length > 40 ? '…' : '')
    : 'Thought'

  return (
    <AuthGuard>
      <div
        className="relative -mx-4 -my-4 flex flex-col overflow-hidden"
        style={{ minHeight: 'calc(100dvh - 3.5rem)' }}
      >
        <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-24 pt-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Thoughts</h1>

          <StatRow
            stats={[
              { value: totalCount, label: 'Total' },
              { value: thisWeekCount, label: 'This week' },
              { value: topTopic ?? '—', label: 'Top topic' },
            ]}
          />

          <ThoughtSearch query={searchQuery} onQueryChange={setSearchQuery} />

          {!isSearching && (
            <div className="flex flex-col gap-2">
              <FilterPills
                label="Type"
                options={filterOptions.types}
                active={activeType}
                onChange={(v) => handleFilterChange('type', v)}
              />
              <FilterPills
                label="Topic"
                options={filterOptions.topics}
                active={activeTopic}
                onChange={(v) => handleFilterChange('topic', v)}
              />
              <FilterPills
                label="People"
                options={filterOptions.people}
                active={activePerson}
                onChange={(v) => handleFilterChange('person', v)}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          {loading || (isSearching && searchLoading) ? (
            <LoadingSpinner />
          ) : displayList.length === 0 ? (
            <EmptyState
              message={
                isSearching
                  ? `No thoughts matching "${searchQuery}"`
                  : 'No thoughts yet.'
              }
              actionLabel={isSearching ? 'Clear search' : undefined}
              onAction={isSearching ? () => setSearchQuery('') : undefined}
            />
          ) : (
            <>
              {displayList.map((t) => (
                <ThoughtCard key={t.id} thought={t} onTap={openDetail} />
              ))}

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-h-[44px] w-full rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  {loadingMore ? 'Loading…' : `Load more (${totalCount - thoughts.length} remaining)`}
                </button>
              )}
            </>
          )}
        </div>

        <DetailPanel
          isOpen={panelOpen}
          onClose={closePanel}
          title={panelTitle}
          onDelete={panelOpen && isOwner ? () => setShowDeleteConfirm(true) : undefined}
        >
          {selectedThought && <ThoughtDetail thought={selectedThought} />}
        </DetailPanel>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete this thought?"
          message="This can't be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </AuthGuard>
  )
}
