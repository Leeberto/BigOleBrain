'use client'

import { useState } from 'react'
import { Badge } from '@/components/shared/Badge'
import {
  approveAgentWork,
  rejectToHuman,
  retryAgentWork,
  type Action,
} from '@/lib/queries/actions'

type ActionDetailProps = {
  action: Action
  onComplete?: () => void
  onAgentAction?: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const STATUS_VARIANT = {
  open: 'gray',
  in_progress: 'blue',
  done: 'green',
  cancelled: 'red',
} as const

const STATUS_LABEL = {
  open: 'Open',
  in_progress: 'In progress',
  done: 'Done',
  cancelled: 'Cancelled',
} as const

export function ActionDetail({ action, onComplete, onAgentAction }: ActionDetailProps) {
  const canComplete = action.status === 'open' || action.status === 'in_progress'
  const isNeedsReview = action.agent_status === 'needs_review'
  const [busy, setBusy] = useState(false)

  async function handleAgentAction(fn: () => Promise<void>) {
    setBusy(true)
    try {
      await fn()
      onAgentAction?.()
    } catch (err) {
      console.error('[ActionDetail] agent action failed', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {isNeedsReview && (
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => handleAgentAction(() => approveAgentWork(action))}
            className="min-h-[44px] flex-1 rounded-lg bg-green-600 text-sm font-medium text-white disabled:opacity-50 dark:bg-green-500"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => handleAgentAction(() => rejectToHuman(action.id))}
            className="min-h-[44px] flex-1 rounded-lg bg-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
          >
            Take over
          </button>
          <button
            disabled={busy}
            onClick={() => handleAgentAction(() => retryAgentWork(action.id))}
            className="min-h-[44px] flex-1 rounded-lg bg-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
          >
            Retry
          </button>
        </div>
      )}

      {!isNeedsReview && canComplete && onComplete && (
        <button
          onClick={onComplete}
          className="min-h-[44px] w-full rounded-lg bg-green-600 text-sm font-medium text-white dark:bg-green-500"
        >
          Mark complete
        </button>
      )}

      <p className="text-base text-gray-900 dark:text-gray-100">{action.content}</p>

      <div className="flex items-center gap-2">
        <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Status</span>
        <Badge label={STATUS_LABEL[action.status]} variant={STATUS_VARIANT[action.status]} />
      </div>

      <div className="flex items-center gap-2">
        <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Due</span>
        <span
          className={`text-sm ${
            action.due_date
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {action.due_date ? formatDate(action.due_date) : 'No due date'}
        </span>
      </div>

      {action.recurrence && (
        <div className="flex items-center gap-2">
          <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Repeats</span>
          <span className="text-sm capitalize text-gray-900 dark:text-gray-100">
            {action.recurrence}
          </span>
        </div>
      )}

      <div className="flex items-start gap-2">
        <span className="mt-0.5 w-24 text-sm text-gray-500 dark:text-gray-400">Tags</span>
        {action.tags && action.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {action.tags.map((tag) => (
              <Badge key={tag} label={tag} variant="gray" />
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">No tags</span>
        )}
      </div>

      {action.blocked_by && (
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Blocked by</p>
          <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300">{action.blocked_by}</p>
        </div>
      )}

      {action.unblocks && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-24 text-sm text-gray-500 dark:text-gray-400">Unblocks</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{action.unblocks}</span>
        </div>
      )}

      {action.thought_id && (
        <div className="flex items-center gap-2">
          <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Source</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Linked to thought</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Created</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDateTime(action.created_at)}
        </span>
      </div>

      {action.agent_output && (
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-400">
            Agent output{action.agent_capability ? ` (${action.agent_capability})` : ''}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-purple-800 dark:text-purple-300">
            {action.agent_output}
          </p>
          {action.agent_completed_at && (
            <p className="mt-1 text-xs text-purple-500 dark:text-purple-400">
              Completed {formatDateTime(action.agent_completed_at)}
            </p>
          )}
        </div>
      )}

      {action.agent_error && (
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-xs font-medium text-red-700 dark:text-red-400">Agent error</p>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">{action.agent_error}</p>
        </div>
      )}

      {action.status === 'done' && action.completed_at && (
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            Completed {formatDateTime(action.completed_at)}
          </p>
          {action.completion_note && (
            <p className="mt-1 text-sm text-green-800 dark:text-green-300">
              {action.completion_note}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
