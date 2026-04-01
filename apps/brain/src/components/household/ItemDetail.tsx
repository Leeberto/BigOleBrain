'use client'

import type { HouseholdItem } from '@/lib/queries/household-items'

type ItemDetailProps = {
  item: HouseholdItem
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function ItemDetail({ item }: ItemDetailProps) {
  const detailEntries = item.details ? Object.entries(item.details) : []

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium text-gray-900 dark:text-gray-100">{item.name}</p>

      {item.category && (
        <div className="flex items-center gap-2">
          <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Category</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {capitalize(item.category)}
          </span>
        </div>
      )}

      {item.location && (
        <div className="flex items-center gap-2">
          <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Location</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{item.location}</span>
        </div>
      )}

      {detailEntries.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Details
          </p>
          <div className="flex flex-col gap-2">
            {detailEntries.map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="min-w-[80px] text-sm text-gray-500 dark:text-gray-400">
                  {capitalize(key)}
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {item.notes && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-24 text-sm text-gray-500 dark:text-gray-400">Notes</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{item.notes}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Created</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(item.created_at)}
        </span>
      </div>
    </div>
  )
}
