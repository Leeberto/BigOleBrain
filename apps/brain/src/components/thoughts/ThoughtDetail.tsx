'use client'

import { Badge } from '@/components/shared/Badge'
import type { BadgeProps } from '@/components/shared/Badge'
import type { Thought } from '@/lib/queries/thoughts'

const TYPE_BADGE_VARIANTS: Record<string, BadgeProps['variant']> = {
  observation: 'blue',
  task: 'amber',
  question: 'purple',
  idea: 'green',
  decision: 'red',
  reflection: 'blue',
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

type ThoughtDetailProps = {
  thought: Thought
}

export function ThoughtDetail({ thought }: ThoughtDetailProps) {
  const meta = thought.metadata
  const type = meta?.type
  const topics = meta?.topics ?? []
  const people = meta?.people ?? []
  const actionItems = meta?.action_items ?? []

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base leading-relaxed text-gray-900 dark:text-gray-100">
        {thought.content}
      </p>

      {type && (
        <div className="flex items-center gap-2">
          <span className="w-24 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">Type</span>
          <Badge label={type} variant={TYPE_BADGE_VARIANTS[type] ?? 'gray'} />
        </div>
      )}

      {topics.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-24 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
            Topics
          </span>
          <div className="flex flex-wrap gap-1">
            {topics.map((t) => (
              <Badge key={t} label={t} variant="gray" />
            ))}
          </div>
        </div>
      )}

      {people.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-24 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
            People
          </span>
          <div className="flex flex-wrap gap-1">
            {people.map((p) => (
              <span key={p} className="text-sm text-gray-700 dark:text-gray-300">
                @{p}
              </span>
            ))}
          </div>
        </div>
      )}

      {meta?.sentiment && (
        <div className="flex items-center gap-2">
          <span className="w-24 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
            Sentiment
          </span>
          <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
            {meta.sentiment}
          </span>
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-24 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
            Actions
          </span>
          <ul className="flex flex-col gap-1">
            {actionItems.map((item, i) => (
              <li key={i} className="text-sm text-gray-900 dark:text-gray-100">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {meta?.source && (
        <div className="flex items-center gap-2">
          <span className="w-24 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
            Source
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{meta.source}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="w-24 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
          Captured
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDateTime(thought.created_at)}
        </span>
      </div>
    </div>
  )
}
