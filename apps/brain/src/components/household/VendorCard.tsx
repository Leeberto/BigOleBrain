'use client'

import { Card } from '@/components/shared/Card'
import type { Vendor } from '@/lib/queries/vendors'

type VendorCardProps = {
  vendor: Vendor
  onTap: (vendor: Vendor) => void
}

function RatingDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-sm text-amber-500">★ {rating}</span>
  )
}

export function VendorCard({ vendor, onTap }: VendorCardProps) {
  return (
    <Card
      title={vendor.name}
      subtitle={vendor.service_type ?? undefined}
      rightContent={vendor.rating != null ? <RatingDisplay rating={vendor.rating} /> : undefined}
      onTap={() => onTap(vendor)}
    />
  )
}
