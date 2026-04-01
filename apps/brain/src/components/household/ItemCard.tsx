'use client'

import { Card } from '@/components/shared/Card'
import type { HouseholdItem } from '@/lib/queries/household-items'

type ItemCardProps = {
  item: HouseholdItem
  onTap: (item: HouseholdItem) => void
}

function buildSubtitle(item: HouseholdItem): string {
  const parts = [item.location, item.category].filter(Boolean)
  return parts.join(' · ')
}

export function ItemCard({ item, onTap }: ItemCardProps) {
  return (
    <Card
      title={item.name}
      subtitle={buildSubtitle(item) || undefined}
      onTap={() => onTap(item)}
    />
  )
}
