'use client'

import { useEffect, useState } from 'react'
import { getHistory, type MaintenanceLog } from '@/lib/queries/maintenance'

type MaintenanceHistoryProps = {
  taskId: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function MaintenanceHistory({ taskId }: MaintenanceHistoryProps) {
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    getHistory(taskId)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [taskId])

  if (loading) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">Loading history…</p>
  }

  if (logs.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">No maintenance logged yet.</p>
  }

  const visible = expanded ? logs : logs.slice(0, 5)

  return (
    <div className="flex flex-col gap-3">
      {visible.map((log) => (
        <div
          key={log.id}
          className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
        >
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatDate(log.completed_at)}
            {log.performed_by && (
              <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                · {log.performed_by}
              </span>
            )}
            {log.cost != null && (
              <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                · {formatCurrency(log.cost)}
              </span>
            )}
          </p>
          {log.notes && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
              {log.notes}
            </p>
          )}
          {log.next_action && (
            <p className="mt-1 text-xs italic text-gray-400 dark:text-gray-500">
              Next: {log.next_action}
            </p>
          )}
        </div>
      ))}

      {!expanded && logs.length > 5 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-sm font-medium text-blue-600 dark:text-blue-400"
        >
          Show all ({logs.length})
        </button>
      )}
    </div>
  )
}
