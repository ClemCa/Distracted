import { useEffect, useState } from 'react'
import TaskForm, { type TaskValues } from '../components/task-form'
import type { Importance, Urgency } from '../types'

type TaskDTO = {
  id: string
  label: string
  urgency: Urgency
  importance: Importance
}

type Props = {
  goBack: () => void
  taskId: string
  onSaved: () => void
}

export default function Edit({ goBack, taskId, onSaved }: Props) {
  const [initial, setInitial] = useState<TaskValues | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: TaskDTO) =>
        setInitial({ label: data.label, urgency: data.urgency, importance: data.importance }),
      )
      .catch((err: Error) => setError(`Could not load task: ${err.message}`))
  }, [taskId])

  if (error) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
        <button
          onClick={goBack}
          className="mb-6 text-sm text-neutral-500 hover:text-white"
        >
          ← Back
        </button>
        <p className="text-sm text-rose-400">{error}</p>
      </div>
    )
  }

  if (!initial) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
        <button
          onClick={goBack}
          className="mb-6 text-sm text-neutral-500 hover:text-white"
        >
          ← Back
        </button>
        <p className="text-sm text-neutral-400">Loading task…</p>
      </div>
    )
  }

  const submit = (values: TaskValues) =>
    fetch(`/api/tasks/${taskId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not update task: HTTP ${res.status}`)
        return res.json()
      })
      .then(() => onSaved())

  return (
    <TaskForm
      initial={initial}
      title="Edit task"
      submitLabel="Save changes"
      submittingLabel="Saving…"
      onBack={goBack}
      onSubmit={submit}
    />
  )
}