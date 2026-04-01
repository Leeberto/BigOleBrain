'use client'

import { Card } from '@/components/shared/Card'
import { Badge, type BadgeProps } from '@/components/shared/Badge'
import type { MaintenanceTask } from '@/lib/queries/maintenance'

type MaintenanceCardProps = {
  task: MaintenanceTask
  onTap: (task: MaintenanceTask) => void
  urgencyLabel: string
  urgencyVariant: BadgeProps['variant']
}

export function buildFrequencyLabel(frequencyDays: number | null): string {
  if (frequencyDays === null) return 'One-time'
  if (frequencyDays === 1) return 'Daily'
  if (frequencyDays === 7) return 'Weekly'
  if (frequencyDays === 14) return 'Every 2 weeks'
  if (frequencyDays === 30) return 'Monthly'
  if (frequencyDays === 60) return 'Every 2 months'
  if (frequencyDays === 90) return 'Quarterly'
  if (frequencyDays === 180) return 'Semi-annual'
  if (frequencyDays === 365) return 'Annual'
  return `Every ${frequencyDays} days`
}

function buildSubtitle(task: MaintenanceTask): string {
  const freq = buildFrequencyLabel(task.frequency_days)
  if (task.category) {
    const cat = task.category.charAt(0).toUpperCase() + task.category.slice(1)
    return `${cat} · ${freq}`
  }
  return freq
}

export function MaintenanceCard({ task, onTap, urgencyLabel, urgencyVariant }: MaintenanceCardProps) {
  const priorityBadges: BadgeProps[] = []
  if (task.priority === 'urgent') {
    priorityBadges.push({ label: 'Urgent', variant: 'red' })
  } else if (task.priority === 'high') {
    priorityBadges.push({ label: 'High', variant: 'amber' })
  }

  return (
    <Card
      title={task.name}
      subtitle={buildSubtitle(task)}
      badges={priorityBadges}
      rightContent={<Badge label={urgencyLabel} variant={urgencyVariant} />}
      onTap={() => onTap(task)}
    />
  )
}
