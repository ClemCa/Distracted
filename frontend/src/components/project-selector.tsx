import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  options: string[]
  onChange: (value: string) => void
}

export default function ProjectSelector({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) setQuery(value)
  }, [value, open])

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const trimmed = query.trim()
  const needle = trimmed.toLowerCase()
  const matches = needle
    ? options.filter((option) => option.toLowerCase().includes(needle))
    : options
  const exact = options.some((option) => option.toLowerCase() === needle)

  const select = (next: string) => {
    onChange(next)
    setQuery(next)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Website redesign"
        className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-sky-500 focus:outline-none"
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 py-1 shadow-xl">
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault()
              select('')
            }}
            className="block w-full px-3 py-2 text-left text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            No project
          </button>
          {matches.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                select(option)
              }}
              className={`block w-full truncate px-3 py-2 text-left text-sm hover:bg-neutral-800 ${
                option === value ? 'text-emerald-300' : 'text-neutral-200'
              }`}
            >
              {option}
            </button>
          ))}
          {trimmed && !exact && (
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                select(trimmed)
              }}
              className="block w-full truncate px-3 py-2 text-left text-sm text-sky-300 hover:bg-neutral-800"
            >
              + Create project “{trimmed}”
            </button>
          )}
          {!trimmed && options.length === 0 && (
            <p className="px-3 py-2 text-xs text-neutral-600">
              No projects yet — type to create one.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
