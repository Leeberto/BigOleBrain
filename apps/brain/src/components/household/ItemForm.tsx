'use client'

import { useState } from 'react'
import type { HouseholdItem } from '@/lib/queries/household-items'

type ItemFormProps = {
  mode: 'create' | 'edit'
  initialItem?: HouseholdItem
  onSave: (payload: Partial<HouseholdItem>) => Promise<void>
  onCancel: () => void
}

type DetailRow = { key: string; value: string }

const CATEGORY_OPTIONS = [
  { label: 'Paint', value: 'paint' },
  { label: 'Appliance', value: 'appliance' },
  { label: 'Measurement', value: 'measurement' },
  { label: 'Document', value: 'document' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'Fixture', value: 'fixture' },
  { label: 'Other', value: 'other' },
]

const inputClasses =
  'w-full min-h-[44px] rounded-lg border border-gray-200 px-3 text-base bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500'

const labelClasses = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'

export function ItemForm({ mode, initialItem, onSave, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initialItem?.name ?? '')
  const [category, setCategory] = useState(initialItem?.category ?? '')
  const [location, setLocation] = useState(initialItem?.location ?? '')
  const [notes, setNotes] = useState(initialItem?.notes ?? '')
  const [nameError, setNameError] = useState(false)
  const [saving, setSaving] = useState(false)

  const [detailRows, setDetailRows] = useState<DetailRow[]>(() => {
    if (!initialItem?.details) return []
    return Object.entries(initialItem.details).map(([key, value]) => ({
      key,
      value: String(value),
    }))
  })

  function addRow() {
    setDetailRows((prev) => [...prev, { key: '', value: '' }])
  }

  function removeRow(index: number) {
    setDetailRows((prev) => prev.filter((_, i) => i !== index))
  }

  function updateRow(index: number, field: 'key' | 'value', val: string) {
    setDetailRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError(true)
      return
    }

    const details: Record<string, string> = {}
    for (const row of detailRows) {
      if (row.key.trim()) {
        details[row.key.trim()] = row.value
      }
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        category: category || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        details: Object.keys(details).length > 0 ? details : null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClasses}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(false) }}
          placeholder="e.g., Living room paint color"
          className={`${inputClasses} ${nameError ? 'border-red-400 dark:border-red-500' : ''}`}
        />
        {nameError && <p className="mt-1 text-xs text-red-500">This field is required</p>}
      </div>

      <div>
        <label className={labelClasses}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClasses}
        >
          <option value="">Select category…</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClasses}>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Kitchen, Master bedroom"
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes…"
          className={`${inputClasses} min-h-[100px] resize-y py-2`}
        />
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <label className={labelClasses}>Details</label>
        <div className="flex flex-col gap-2">
          {detailRows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={row.key}
                onChange={(e) => updateRow(i, 'key', e.target.value)}
                placeholder="Key"
                className={`${inputClasses} flex-1`}
              />
              <input
                type="text"
                value={row.value}
                onChange={(e) => updateRow(i, 'value', e.target.value)}
                placeholder="Value"
                className={`${inputClasses} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-gray-400 hover:text-red-500"
                aria-label="Remove field"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="mt-1 text-left text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            + Add field
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] w-full rounded-lg bg-blue-600 text-sm font-medium text-white disabled:opacity-50 dark:bg-blue-500"
        >
          {saving ? 'Saving…' : mode === 'create' ? 'Create item' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] w-full text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
