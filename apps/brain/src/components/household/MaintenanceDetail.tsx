'use client'

import { Badge } from '@/components/shared/Badge'
import { MaintenanceHistory } from './MaintenanceHistory'
import { buildFrequencyLabel } from './MaintenanceCard'
import type { MaintenanceTask } from '@/lib/queries/maintenance'

type MaintenanceDetailProps = {
  task: MaintenanceTask
  onLogCompletion: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const PRIORITY_VARIANT = {
  low: 'gray',
  medium: 'blue',
  high: 'amber',
  urgent: 'red',
} as const

export function MaintenanceDetail({ task, onLogCompletion }: MaintenanceDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onLogCompletion}
        className="min-h-[44px] w-full rounded-lg bg-green-600 text-sm font-medium text-white dark:bg-green-500"
      >
        Log completion
      </button>

      <p className="text-base font-medium text-gray-900 dark:text-gray-100">{task.name}</p>

      {task.category && (
        <div className="flex items-center gap-2">
          <span className="w-28 text-sm text-gray-500 dark:text-gray-400">Category</span>
          <span className="text-sm capitalize text-gray-900 dark:text-gray-100">
            {task.category}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="w-28 text-sm text-gray-500 dark:text-gray-400">Priority</span>
        <Badge
          label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          variant={PRIORITY_VARIANT[task.priority]}
        />
      </div>

      <div className="flex items-start gap-2">
        <span className="mt-0.5 w-28 text-sm text-gray-500 dark:text-gray-400">Schedule</span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {buildFrequencyLabel(task.frequency_days)}
          </span>
          {task.next_due && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Next due: {formatDate(task.next_due)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-28 text-sm text-gray-500 dark:text-gray-400">Last completed</span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {task.last_completed ? formatDate(task.last_completed) : 'Never'}
        </span>
      </div>

      {task.notes && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-28 text-sm text-gray-500 dark:text-gray-400">Notes</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{task.notes}</span>
        </div>
      )}

      <div className="mt-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Maintenance history
        </p>
        <MaintenanceHistory taskId={task.id} />
      </div>
    </div>
  )
}
