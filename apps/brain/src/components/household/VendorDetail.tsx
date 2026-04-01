'use client'

import type { Vendor } from '@/lib/queries/vendors'

type VendorDetailProps = {
  vendor: Vendor
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-sm text-amber-500">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      <span className="ml-1 text-gray-500 dark:text-gray-400">({rating}/5)</span>
    </span>
  )
}

export function VendorDetail({ vendor }: VendorDetailProps) {
  const hasContact = vendor.phone || vendor.email || vendor.website

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium text-gray-900 dark:text-gray-100">{vendor.name}</p>

      {vendor.service_type && (
        <div className="flex items-center gap-2">
          <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Service</span>
          <span className="text-sm capitalize text-gray-900 dark:text-gray-100">
            {vendor.service_type}
          </span>
        </div>
      )}

      {vendor.rating != null && (
        <div className="flex items-center gap-2">
          <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Rating</span>
          <StarRating rating={vendor.rating} />
        </div>
      )}

      {hasContact ? (
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          {vendor.phone && (
            <a
              href={`tel:${vendor.phone}`}
              className="flex items-center gap-3 min-h-[44px] rounded-lg px-1 text-blue-600 dark:text-blue-400"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
              </svg>
              <span className="text-base font-medium">{vendor.phone}</span>
            </a>
          )}

          {vendor.email && (
            <a
              href={`mailto:${vendor.email}`}
              className="flex items-center gap-3 min-h-[44px] rounded-lg px-1 text-blue-600 dark:text-blue-400"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span className="text-base font-medium">{vendor.email}</span>
            </a>
          )}

          {vendor.website && (
            <a
              href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 min-h-[44px] rounded-lg px-1 text-blue-600 dark:text-blue-400"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-base font-medium">{vendor.website}</span>
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">No phone, email, or website on file</p>
      )}

      <div className="flex items-center gap-2">
        <span className="w-24 text-sm text-gray-500 dark:text-gray-400">Last used</span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {vendor.last_used ? formatDate(vendor.last_used) : 'Never'}
        </span>
      </div>

      {vendor.notes && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-24 text-sm text-gray-500 dark:text-gray-400">Notes</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{vendor.notes}</span>
        </div>
      )}
    </div>
  )
}
