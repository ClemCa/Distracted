import { useEffect, useState } from 'react'
import type { SubmitEvent } from 'react'
import type { DeferStatus, Importance, Subtask, Urgency } from '../types'
import ProjectSelector from './project-selector'
import DependencySelector from './dependency-selector'
import ConfirmDialog from './confirm-dialog'

export type TaskValues = {
  label: string
  description: string
  urgency: Urgency
  importance: Importance
  project: string
  status: DeferStatus
  dependencyIds: string[]
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

const deferOptions: { value: DeferStatus; label: string; selected: string }[] = [
  { value: 'none', label: 'No status', selected: 'border-neutral-400 bg-neutral-500/10 text-neutral-200' },
  { value: 'later', label: 'Later', selected: 'border-amber-500 bg-amber-500/10 text-amber-300' },
  { value: 'notToday', label: 'Not today', selected: 'border-rose-500 bg-rose-500/10 text-rose-300' },
]

type Props = {
  initial: TaskValues
  title: string
  submitLabel: string
  submittingLabel: string
  onBack: () => void
  onSubmit: (values: TaskValues) => Promise<void>
  showChecklist?: boolean
  excludeId?: string
  onDelete?: () => void | Promise<void>
}

export default function TaskForm({
  initial,
  title,
  submitLabel,
  submittingLabel,
  onBack,
  onSubmit,
  showChecklist = false,
  excludeId,
  onDelete,
}: Props) {
  const [label, setLabel] = useState(initial.label)
  const [description, setDescription] = useState(initial.description ?? '')
  const [urgency, setUrgency] = useState<Urgency>(initial.urgency)
  const [importance, setImportance] = useState<Importance>(initial.importance)
  const [status, setStatus] = useState<DeferStatus>(initial.status ?? 'none')
  const [project, setProject] = useState(initial.project ?? '')
  const [dependencyIds, setDependencyIds] = useState<string[]>(initial.dependencyIds ?? [])
  const [subtasks, setSubtasks] = useState<Subtask[]>(initial.subtasks ?? [])
  const [projects, setProjects] = useState<string[]>([])
  const [tasks, setTasks] = useState<{ id: string; label: string }[]>([])
  const [newStep, setNewStep] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: string[]) => setProjects(data))
      .catch(() => setProjects([]))

    fetch('/api/tasks')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id: string; label: string }[]) =>
        setTasks(data.map((task) => ({ id: task.id, label: task.label }))),
      )
      .catch(() => setTasks([]))
  }, [])

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
    onSubmit({
      label: label.trim(),
      description: description.trim(),
      urgency,
      importance,
      project: project.trim(),
      status,
      dependencyIds,
      subtasks,
    }).catch((err: Error) => {
      setError(err.message)
      setSubmitting(false)
    })
  }

  const confirmDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete task.')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="flex h-fit w-full max-w-2xl flex-col rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-neutral-500 hover:text-white"
        >
          ← Back
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-sm font-semibold text-rose-400 hover:text-rose-300"
          >
            Delete task
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold">{title}</h2>

      <form onSubmit={submit} className="mt-6 flex min-h-0 flex-1 flex-col gap-4">
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

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, notes, or acceptance criteria…"
            rows={2}
            className="resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-sky-500 focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Project
            </span>
            <ProjectSelector value={project} options={projects} onChange={setProject} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Depends on
            </span>
            <DependencySelector
              selectedIds={dependencyIds}
              options={tasks
                .filter((task) => task.id !== excludeId)
                .map((task) => ({ id: task.id, label: task.label }))}
              onChange={setDependencyIds}
            />
            <p className="text-xs text-neutral-600">
              This task stays out of the feed until every dependency is completed.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            When
          </span>
          <div className="flex flex-wrap gap-2">
            {deferOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  status === option.value
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
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Checklist
            </span>
            <ul className="flex min-h-0 max-h-48 flex-1 flex-col gap-2 overflow-y-auto">
              {subtasks.map((subtask, index) => (
                <li
                  key={index}
                  className="group flex shrink-0 items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
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
            <div className="flex shrink-0 gap-2">
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

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete task?"
          message="This permanently deletes the task and can't be undone."
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}