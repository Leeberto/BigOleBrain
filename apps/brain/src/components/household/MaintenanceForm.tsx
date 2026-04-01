'use client'

import { EditForm, type FieldConfig } from '@/components/shared/EditForm'
import type { MaintenanceTask } from '@/lib/queries/maintenance'

type MaintenanceFormProps = {
  mode: 'create' | 'edit'
  initialTask?: MaintenanceTask
  onSave: (payload: Partial<MaintenanceTask>) => Promise<void>
  onCancel: () => void
}

const FIELDS: FieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Replace HVAC filter',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    placeholder: 'Select category…',
    options: [
      { label: 'HVAC', value: 'hvac' },
      { label: 'Plumbing', value: 'plumbing' },
      { label: 'Exterior', value: 'exterior' },
      { label: 'Appliance', value: 'appliance' },
      { label: 'Landscaping', value: 'landscaping' },
      { label: 'Electrical', value: 'electrical' },
      { label: 'General', value: 'general' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    placeholder: 'Select priority…',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Urgent', value: 'urgent' },
    ],
  },
  {
    name: 'frequency_days',
    label: 'Repeats every X days',
    type: 'number',
    placeholder: 'e.g., 90 for quarterly',
  },
  {
    name: 'next_due',
    label: 'Next due date',
    type: 'date',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Any additional details…',
  },
]

function buildPayload(values: Record<string, any>): Partial<MaintenanceTask> {
  return {
    name: values.name?.trim(),
    category: values.category || null,
    priority: (values.priority as MaintenanceTask['priority']) || 'medium',
    frequency_days: values.frequency_days ? Number(values.frequency_days) : null,
    next_due: values.next_due || null,
    notes: values.notes?.trim() || null,
  }
}

export function MaintenanceForm({ mode, initialTask, onSave, onCancel }: MaintenanceFormProps) {
  const initialValues: Record<string, any> = {
    name: initialTask?.name ?? '',
    category: initialTask?.category ?? '',
    priority: initialTask?.priority ?? 'medium',
    frequency_days: initialTask?.frequency_days?.toString() ?? '',
    next_due: initialTask?.next_due ? initialTask.next_due.slice(0, 10) : '',
    notes: initialTask?.notes ?? '',
  }

  return (
    <div>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        Common frequencies: 30 = monthly, 90 = quarterly, 180 = semi-annual, 365 = annual
      </p>
      <EditForm
        fields={FIELDS}
        initialValues={initialValues}
        onSave={(values) => onSave(buildPayload(values))}
        onCancel={onCancel}
        saveLabel={mode === 'create' ? 'Create task' : 'Save changes'}
      />
    </div>
  )
}
