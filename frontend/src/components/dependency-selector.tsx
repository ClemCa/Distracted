import { useEffect, useRef, useState } from 'react'

export type DependencyOption = {
  id: string
  label: string
}

type Props = {
  selectedIds: string[]
  options: DependencyOption[]
  onChange: (ids: string[]) => void
}

export default function DependencySelector({ selectedIds, options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const selected = selectedIds
    .map((id) => options.find((option) => option.id === id))
    .filter((option): option is DependencyOption => Boolean(option))

  const remaining = options.filter((option) => !selectedIds.includes(option.id))
  const needle = query.trim().toLowerCase()
  const matches = remaining.filter(
    (option) => !needle || option.label.toLowerCase().includes(needle),
  )

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((existing) => existing !== id)
        : [...selectedIds, id],
    )
  }

  const remove = (id: string) =>
    onChange(selectedIds.filter((existing) => existing !== id))

  return (
    <div ref={rootRef} className="relative">
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selected.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200"
            >
              {option.label}
              <button
                type="button"
                onClick={() => remove(option.id)}
                className="text-neutral-600 hover:text-rose-400"
                title="Remove dependency"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search tasks to depend on…"
        className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-sky-500 focus:outline-none"
      />

      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 py-1 shadow-xl">
          {matches.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => toggle(option.id)}
                className="size-4 shrink-0 accent-emerald-500"
              />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
            </label>
          ))}
          {matches.length === 0 && (
            <p className="px-3 py-2 text-xs text-neutral-600">
              {options.length === 0 ? 'No other tasks yet.' : 'No matching tasks.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
