'use client'

import { useState } from 'react'
import type { MaintenanceLogEntry } from '@/lib/queries/maintenance'

type LogMaintenanceDialogProps = {
  isOpen: boolean
  taskName: string
  onLog: (entry: MaintenanceLogEntry) => Promise<void>
  onCancel: () => void
}

const inputClasses =
  'w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-base bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500'

export function LogMaintenanceDialog({
  isOpen,
  taskName,
  onLog,
  onCancel,
}: LogMaintenanceDialogProps) {
  const [performedBy, setPerformedBy] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  function reset() {
    setPerformedBy('')
    setCost('')
    setNotes('')
    setNextAction('')
  }

  async function handleLog() {
    setSaving(true)
    try {
      await onLog({
        performed_by: performedBy.trim() || undefined,
        cost: cost ? Number(cost) : undefined,
        notes: notes.trim() || undefined,
        next_action: nextAction.trim() || undefined,
      })
      reset()
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    reset()
    onCancel()
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
      <div className="relative z-10 mx-6 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Log completion
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{taskName}</p>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Performed by
            </label>
            <input
              type="text"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              placeholder="Self, vendor name, etc."
              className={inputClasses}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cost
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="$"
              min="0"
              step="0.01"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What work was performed?"
              className={`${inputClasses} min-h-[80px] resize-y py-2`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Next action
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Recommendations for next time"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 min-h-[44px] rounded-lg border border-gray-200 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleLog}
            disabled={saving}
            className="flex-1 min-h-[44px] rounded-lg bg-green-600 text-sm font-medium text-white disabled:opacity-50 dark:bg-green-500"
          >
            {saving ? 'Logging…' : 'Log'}
          </button>
        </div>
      </div>
    </div>
  )
}
