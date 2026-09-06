import { useState } from 'react'
import type { SubmitEvent } from 'react'
import type { Importance, Urgency } from '../types'

export type TaskValues = {
  label: string
  urgency: Urgency
  importance: Importance
}

const urgencyOptions: { value: Urgency; label: string; selected: string }[] = [
  { value: 'urgent', label: 'Urgent', selected: 'border-rose-500 bg-rose-500/10 text-rose-300' },
  { value: 'high', label: 'High', selected: 'border-amber-500 bg-amber-500/10 text-amber-300' },
  { value: 'medium', label: 'Medium', selected: 'border-sky-500 bg-sky-500/10 text-sky-300' },
  { value: 'low', label: 'Low', selected: 'border-neutral-500 bg-neutral-500/10 text-neutral-200' },
]

const importanceOptions: { value: Importance; label: string; selected: string }[] = [
  { value: 'high', label: 'High', selected: 'border-violet-500 bg-violet-500/10 text-violet-300' },
  { value: 'medium', label: 'Medium', selected: 'border-sky-500 bg-sky-500/10 text-sky-300' },
  { value: 'low', label: 'Low', selected: 'border-neutral-500 bg-neutral-500/10 text-neutral-200' },
]

type Props = {
  initial: TaskValues
  title: string
  submitLabel: string
  submittingLabel: string
  onBack: () => void
  onSubmit: (values: TaskValues) => Promise<void>
}

export default function TaskForm({
  initial,
  title,
  submitLabel,
  submittingLabel,
  onBack,
  onSubmit,
}: Props) {
  const [label, setLabel] = useState(initial.label)
  const [urgency, setUrgency] = useState<Urgency>(initial.urgency)
  const [importance, setImportance] = useState<Importance>(initial.importance)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!label.trim()) {
      setError('Please enter a task name.')
      return
    }
    setError(null)
    setSubmitting(true)
    onSubmit({ label: label.trim(), urgency, importance }).catch((err: Error) => {
      setError(err.message)
      setSubmitting(false)
    })
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-neutral-500 hover:text-white"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold">{title}</h2>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Task
          </span>
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What needs doing?"
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-sky-500 focus:outline-none"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Urgency
          </span>
          <div className="flex flex-wrap gap-2">
            {urgencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setUrgency(option.value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  urgency === option.value
                    ? option.selected
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Importance
          </span>
          <div className="flex flex-wrap gap-2">
            {importanceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setImportance(option.value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  importance === option.value
                    ? option.selected
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </form>
    </div>
  )
}