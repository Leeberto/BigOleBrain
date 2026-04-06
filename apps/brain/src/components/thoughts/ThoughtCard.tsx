'use client'

import { Card } from '@/components/shared/Card'
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildBadges(thought: Thought): BadgeProps[] {
  const badges: BadgeProps[] = []
  const meta = thought.metadata

  const type = meta?.type
  if (type) {
    badges.push({ label: type, variant: TYPE_BADGE_VARIANTS[type] ?? 'gray' })
  }

  const topics = meta?.topics ?? []
  for (const topic of topics.slice(0, 3)) {
    badges.push({ label: topic, variant: 'gray' })
  }
  if (topics.length > 3) {
    badges.push({ label: `+${topics.length - 3}`, variant: 'gray' })
  }

  const firstPerson = meta?.people?.[0]
  if (firstPerson) {
    badges.push({ label: `@${firstPerson}`, variant: 'gray' })
  }

  return badges
}

type ThoughtCardProps = {
  thought: Thought
  onTap: (thought: Thought) => void
}

export function ThoughtCard({ thought, onTap }: ThoughtCardProps) {
  const title =
    thought.content.length > 280
      ? thought.content.slice(0, 280) + '…'
      : thought.content

  return (
    <Card
      title={title}
      subtitle={formatDate(thought.created_at)}
      badges={buildBadges(thought)}
      onTap={() => onTap(thought)}
    />
  )
}
