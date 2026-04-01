'use client'

import { EditForm, type FieldConfig } from '@/components/shared/EditForm'
import type { Vendor } from '@/lib/queries/vendors'

type VendorFormProps = {
  mode: 'create' | 'edit'
  initialVendor?: Vendor
  onSave: (payload: Partial<Vendor>) => Promise<void>
  onCancel: () => void
}

const FIELDS: FieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., ABC Plumbing',
  },
  {
    name: 'service_type',
    label: 'Service type',
    type: 'text',
    placeholder: 'e.g., Plumber, Electrician, Landscaper',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: '(555) 555-5555',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'contact@example.com',
  },
  {
    name: 'website',
    label: 'Website',
    type: 'text',
    placeholder: 'example.com',
  },
  {
    name: 'rating',
    label: 'Rating',
    type: 'select',
    placeholder: 'No rating',
    options: [
      { label: '★★★★★  5 — Excellent', value: '5' },
      { label: '★★★★☆  4 — Good', value: '4' },
      { label: '★★★☆☆  3 — Average', value: '3' },
      { label: '★★☆☆☆  2 — Below average', value: '2' },
      { label: '★☆☆☆☆  1 — Poor', value: '1' },
    ],
  },
  {
    name: 'last_used',
    label: 'Last used',
    type: 'date',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Any notes about this vendor…',
  },
]

function buildPayload(values: Record<string, any>): Partial<Vendor> {
  return {
    name: values.name?.trim(),
    service_type: values.service_type?.trim() || null,
    phone: values.phone?.trim() || null,
    email: values.email?.trim() || null,
    website: values.website?.trim() || null,
    rating: values.rating ? Number(values.rating) : null,
    last_used: values.last_used || null,
    notes: values.notes?.trim() || null,
  }
}

export function VendorForm({ mode, initialVendor, onSave, onCancel }: VendorFormProps) {
  const initialValues: Record<string, any> = {
    name: initialVendor?.name ?? '',
    service_type: initialVendor?.service_type ?? '',
    phone: initialVendor?.phone ?? '',
    email: initialVendor?.email ?? '',
    website: initialVendor?.website ?? '',
    rating: initialVendor?.rating?.toString() ?? '',
    last_used: initialVendor?.last_used ?? '',
    notes: initialVendor?.notes ?? '',
  }

  return (
    <EditForm
      fields={FIELDS}
      initialValues={initialValues}
      onSave={(values) => onSave(buildPayload(values))}
      onCancel={onCancel}
      saveLabel={mode === 'create' ? 'Create vendor' : 'Save changes'}
    />
  )
}
