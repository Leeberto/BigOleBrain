'use client'

import { useEffect, useRef, useState } from 'react'

type ThoughtSearchProps = {
  query: string
  onQueryChange: (q: string) => void
}

export function ThoughtSearch({ query, onQueryChange }: ThoughtSearchProps) {
  const [local, setLocal] = useState(query)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external clear (e.g. filter change resets query)
  useEffect(() => {
    if (query === '') setLocal('')
  }, [query])

  function handleChange(value: string) {
    setLocal(value)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onQueryChange(value), 400)
  }

  function handleClear() {
    setLocal('')
    if (timer.current) clearTimeout(timer.current)
    onQueryChange('')
  }

  return (
    <div className="relative">
      <input
        type="search"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search thoughts…"
        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:bg-gray-900"
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-gray-400"
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>
      )}
    </div>
  )
}
