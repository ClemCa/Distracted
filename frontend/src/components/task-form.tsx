import { useState } from 'react'
import type { SubmitEvent } from 'react'
import type { Importance, Subtask, Urgency } from '../types'

export type TaskValues = {
  label: string
  urgency: Urgency
  importance: Importance
  subtasks: Subtask[]
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
  showChecklist?: boolean
}

export default function TaskForm({
  initial,
  title,
  submitLabel,
  submittingLabel,
  onBack,
  onSubmit,
  showChecklist = false,
}: Props) {
  const [label, setLabel] = useState(initial.label)
  const [urgency, setUrgency] = useState<Urgency>(initial.urgency)
  const [importance, setImportance] = useState<Importance>(initial.importance)
  const [subtasks, setSubtasks] = useState<Subtask[]>(initial.subtasks ?? [])
  const [newStep, setNewStep] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const addSubtask = () => {
    const text = newStep.trim()
    if (!text) return
    setSubtasks((prev) => [...prev, { text, done: false }])
    setNewStep('')
  }

  const toggleSubtask = (index: number) =>
    setSubtasks((prev) => prev.map((s, i) => (i === index ? { ...s, done: !s.done } : s)))

  const removeSubtask = (index: number) =>
    setSubtasks((prev) => prev.filter((_, i) => i !== index))

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!label.trim()) {
      setError('Please enter a task name.')
      return
    }
    setError(null)
    setSubmitting(true)
    onSubmit({ label: label.trim(), urgency, importance, subtasks }).catch((err: Error) => {
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

        {showChecklist && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Checklist
            </span>
            <ul className="flex flex-col gap-2">
              {subtasks.map((subtask, index) => (
                <li
                  key={index}
                  className="group flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={subtask.done}
                    onChange={() => toggleSubtask(index)}
                    className="size-4 shrink-0 accent-emerald-500"
                  />
                  <span
                    className={`min-w-0 flex-1 text-sm ${
                      subtask.done ? 'text-neutral-600 line-through' : 'text-neutral-200'
                    }`}
                  >
                    {subtask.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="text-xs text-neutral-700 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                    title="Remove step"
                  >
                    ✕
                  </button>
                </li>
              ))}
              {subtasks.length === 0 && (
                <li className="rounded-lg border border-dashed border-neutral-800 px-3 py-3 text-sm text-neutral-600">
                  No steps yet.
                </li>
              )}
            </ul>
            <div className="flex gap-2">
              <input
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSubtask()
                  }
                }}
                placeholder="Add a step…"
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Add
              </button>
            </div>
          </div>
        )}

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