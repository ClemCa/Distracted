import TaskForm, { type TaskValues } from '../components/task-form'

type Props = {
  goBack: () => void
  onCreated: () => void
}

export default function Create({ goBack, onCreated }: Props) {
  const submit = (values: TaskValues) =>
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not create task: HTTP ${res.status}`)
        return res.json()
      })
      .then(() => onCreated())

  return (
    <TaskForm
      initial={{ label: '', urgency: 'medium', importance: 'medium', subtasks: [] }}
      title="New task"
      submitLabel="Create task"
      submittingLabel="Creating…"
      onBack={goBack}
      onSubmit={submit}
    />
  )
}
