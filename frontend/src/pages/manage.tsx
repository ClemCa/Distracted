import { useEffect, useState } from 'react'
import type { Importance, Urgency } from '../types'
import ConfirmDialog from '../components/confirm-dialog'

type TaskDTO = {
  id: string
  label: string
  urgency: Urgency
  importance: Importance
  project: string | null
  delayed: boolean
  completedAt: string | null
  progress: number | null
}

const urgencyStyles: Record<Urgency, string> = {
  urgent: 'border-rose-500/40 text-rose-400',
  high: 'border-amber-500/40 text-amber-400',
  medium: 'border-sky-500/40 text-sky-400',
  low: 'border-neutral-500/40 text-neutral-400',
}

const importanceStyles: Record<Importance, string> = {
  high: 'border-violet-500/40 text-violet-400',
  medium: 'border-sky-500/40 text-sky-400',
  low: 'border-neutral-500/40 text-neutral-400',
}

const urgencyActiveStyles: Record<Urgency, string> = {
  urgent: 'border-rose-500 bg-rose-500/20 text-rose-300',
  high: 'border-amber-500 bg-amber-500/20 text-amber-300',
  medium: 'border-sky-500 bg-sky-500/20 text-sky-300',
  low: 'border-neutral-400 bg-neutral-500/20 text-neutral-200',
}

const importanceActiveStyles: Record<Importance, string> = {
  high: 'border-violet-500 bg-violet-500/20 text-violet-300',
  medium: 'border-sky-500 bg-sky-500/20 text-sky-300',
  low: 'border-neutral-400 bg-neutral-500/20 text-neutral-200',
}

const statusActiveStyles: Record<StatusFilter, string> = {
  notStarted: 'border-neutral-400 bg-neutral-500/20 text-neutral-200',
  started: 'border-sky-500 bg-sky-500/20 text-sky-300',
  completed: 'border-emerald-500 bg-emerald-500/20 text-emerald-300',
}

const statusStyles: Record<StatusFilter, string> = {
  notStarted: 'border-neutral-500/40 text-neutral-400',
  started: 'border-sky-500/40 text-sky-400',
  completed: 'border-emerald-500/40 text-emerald-400',
}

const inactiveStyle =
  'border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300'

const urgencyValues: Urgency[] = ['urgent', 'high', 'medium', 'low']
const importanceValues: Importance[] = ['high', 'medium', 'low']

type StatusFilter = 'notStarted' | 'started' | 'completed'

const statusValues: StatusFilter[] = ['notStarted', 'started', 'completed']

const statusLabels: Record<StatusFilter, string> = {
  notStarted: 'not started',
  started: 'started',
  completed: 'completed',
}

type Props = {
  changePage: (page: string) => void
  goBack: () => void
  onEdit: (id: string) => void
}

export default function Manage({ changePage, goBack, onEdit }: Props) {
  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TaskDTO | null>(null)
  const [urgencyFilter, setUrgencyFilter] = useState<Set<Urgency>>(new Set())
  const [importanceFilter, setImportanceFilter] = useState<Set<Importance>>(new Set())
  const [statusFilter, setStatusFilter] = useState<Set<StatusFilter>>(
    new Set<StatusFilter>(['notStarted', 'started']),
  )

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: TaskDTO[]) => setTasks(data))
      .catch((err: Error) => setError(`Could not load tasks: ${err.message}`))
  }, [])

  const del = (id: string) => {
    setDeletingId(id)
    fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setTasks((prev) => prev.filter((t) => t.id !== id))
      })
      .catch((err: Error) => setError(`Could not delete task: ${err.message}`))
      .finally(() => setDeletingId(null))
  }

  const toggleUrgency = (value: Urgency) =>
    setUrgencyFilter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })

  const toggleImportance = (value: Importance) =>
    setImportanceFilter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })

  const toggleStatus = (value: StatusFilter) =>
    setStatusFilter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })

  const statusOf = (task: TaskDTO): StatusFilter =>
    task.completedAt
      ? 'completed'
      : task.progress != null && task.progress > 0
        ? 'started'
        : 'notStarted'

  const clearFilters = () => {
    setUrgencyFilter(new Set())
    setImportanceFilter(new Set())
    setStatusFilter(new Set<StatusFilter>(['notStarted', 'started']))
  }

  const filtered = tasks.filter((task) => {
    if (urgencyFilter.size > 0 && !urgencyFilter.has(task.urgency)) return false
    if (importanceFilter.size > 0 && !importanceFilter.has(task.importance)) return false
    if (statusFilter.size > 0 && !statusFilter.has(statusOf(task))) return false
    return true
  })

  const defaultStatus = new Set<StatusFilter>(['notStarted', 'started'])
  const isDefaultStatus =
    statusFilter.size === defaultStatus.size &&
    [...statusFilter].every((value) => defaultStatus.has(value))
  const hasFilters =
    urgencyFilter.size > 0 || importanceFilter.size > 0 || !isDefaultStatus

  return (
    <div className="flex w-full max-w-2xl h-5/6 flex-col font-mono">
      <div className="mb-4 flex items-center justify-between border-b-2 border-neutral-700 pb-3">
        <button
          onClick={goBack}
          className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-white"
        >
          ← back
        </button>
        <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          manage tasks
        </h2>
        <button
          onClick={() => changePage('create')}
          className="text-xs uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300"
        >
          + new
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-neutral-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            urgency
          </span>
          {urgencyValues.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleUrgency(value)}
              className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                urgencyFilter.has(value) ? urgencyActiveStyles[value] : inactiveStyle
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            priority
          </span>
          {importanceValues.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleImportance(value)}
              className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                importanceFilter.has(value) ? importanceActiveStyles[value] : inactiveStyle
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            status
          </span>
          {statusValues.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleStatus(value)}
              className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                statusFilter.has(value) ? statusActiveStyles[value] : inactiveStyle
              }`}
            >
              {statusLabels[value]}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-white"
          >
            clear
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-xs text-rose-400">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {tasks.length === 0
            ? 'No tasks yet. Press + new to create one.'
            : 'No tasks match the selected filters.'}
        </p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {filtered.map((task) => {
            const status = task.completedAt
              ? { label: 'done', className: 'border-emerald-500/40 text-emerald-400' }
              : task.delayed
                ? { label: 'later', className: 'border-amber-500/40 text-amber-400' }
                : null
            const taskStatus = statusOf(task)
            return (
              <li
                key={task.id}
                className="flex items-center gap-2 border border-neutral-700 bg-neutral-900/60 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-100">
                  {task.label}
                </span>
                {task.project && (
                  <span className="border border-neutral-600 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-400">
                    {task.project}
                  </span>
                )}
                {status && (
                  <span
                    className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${status.className}`}
                  >
                    {status.label}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleUrgency(task.urgency)}
                  title={`Filter by urgency: ${task.urgency}`}
                  className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wide hover:opacity-80 ${
                    urgencyFilter.has(task.urgency)
                      ? urgencyActiveStyles[task.urgency]
                      : urgencyStyles[task.urgency]
                  }`}
                >
                  {task.urgency}
                </button>
                <button
                  type="button"
                  onClick={() => toggleImportance(task.importance)}
                  title={`Filter by priority: ${task.importance}`}
                  className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wide hover:opacity-80 ${
                    importanceFilter.has(task.importance)
                      ? importanceActiveStyles[task.importance]
                      : importanceStyles[task.importance]
                  }`}
                >
                  {task.importance}
                </button>
                {task.progress != null && task.progress > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleStatus(taskStatus)}
                    title={`Progress: ${task.progress}% — toggle ${statusLabels[taskStatus]} filter`}
                    className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wide hover:opacity-80 ${
                      statusFilter.has(taskStatus)
                        ? statusActiveStyles[taskStatus]
                        : statusStyles[taskStatus]
                    }`}
                  >
                    {task.progress}%
                  </button>
                )}
                <button
                  onClick={() => onEdit(task.id)}
                  className="border border-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  edit
                </button>
                <button
                  onClick={() => setPendingDelete(task)}
                  disabled={deletingId === task.id}
                  className="border border-rose-500/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-rose-400 hover:bg-rose-500/10 disabled:opacity-40"
                >
                  {deletingId === task.id ? '…' : 'del'}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={`This permanently deletes “${pendingDelete.label}” and can't be undone.`}
          confirmLabel="Delete"
          busy={deletingId === pendingDelete.id}
          onConfirm={() => {
            del(pendingDelete.id)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}