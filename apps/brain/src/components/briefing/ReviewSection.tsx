'use client'

import { useState } from 'react'
import { Badge } from '@/components/shared/Badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SectionHeader } from '@/components/shared/SectionHeader'
import {
  approveAgentWork,
  rejectToHuman,
  retryAgentWork,
  type Action,
} from '@/lib/queries/actions'

type ReviewSectionProps = {
  loading: boolean
  actions: Action[]
  onUpdated: () => void
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trim() + '...'
}

function ReviewCard({ action, onUpdated }: { action: Action; onUpdated: () => void }) {
  const [busy, setBusy] = useState(false)

  async function handleAction(fn: () => Promise<void>) {
    setBusy(true)
    try {
      await fn()
      onUpdated()
    } catch (err) {
      console.error('[ReviewCard] action failed', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          {action.content}
        </p>
        {action.agent_capability && (
          <Badge label={action.agent_capability} variant="purple" />
        )}
      </div>

      {action.agent_output && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {truncate(action.agent_output, 150)}
        </p>
      )}

      {action.agent_error && (
        <div className="mt-1.5 rounded bg-red-50 px-2 py-1 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400">
            {truncate(action.agent_error, 120)}
          </p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          disabled={busy}
          onClick={() => handleAction(() => approveAgentWork(action))}
          className="min-h-[36px] flex-1 rounded-lg bg-green-600 text-xs font-medium text-white disabled:opacity-50 dark:bg-green-500"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() => handleAction(() => rejectToHuman(action.id))}
          className="min-h-[36px] flex-1 rounded-lg bg-gray-200 text-xs font-medium text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
        >
          Take over
        </button>
        <button
          disabled={busy}
          onClick={() => handleAction(() => retryAgentWork(action.id))}
          className="min-h-[36px] flex-1 rounded-lg bg-gray-200 text-xs font-medium text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export function ReviewSection({ loading, actions, onUpdated }: ReviewSectionProps) {
  if (loading) {
    return (
      <section>
        <SectionHeader label="Agent work to review" />
        <LoadingSpinner size="sm" />
      </section>
    )
  }

  if (actions.length === 0) return null

  return (
    <section>
      <SectionHeader label="Agent work to review" />
      <div className="flex flex-col gap-2">
        {actions.slice(0, 5).map((action) => (
          <ReviewCard key={action.id} action={action} onUpdated={onUpdated} />
        ))}
      </div>
    </section>
  )
}
