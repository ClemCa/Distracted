import { useEffect, useState } from 'react'
import type { Importance, Subtask, Urgency } from '../types'

type FocusTask = {
    label: string
    urgency: Urgency
    importance: Importance
    progress: number | null
    subtasks: Subtask[]
}

type Props = {
    taskId: string
    onDone: () => void
    onContinueLater: () => void
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

export default function Focus({ taskId, onDone, onContinueLater }: Props) {
    const [task, setTask] = useState<FocusTask | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [subtasks, setSubtasks] = useState<Subtask[]>([])
    const [newStep, setNewStep] = useState('')
    const [finishing, setFinishing] = useState(false)
    const [leaving, setLeaving] = useState(false)

    useEffect(() => {
        fetch(`/api/tasks/${taskId}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json()
            })
            .then((data: FocusTask) => {
                setTask(data)
                setProgress(data.progress ?? 0)
                setSubtasks(data.subtasks ?? [])
            })
            .catch((err: Error) => setError(`Could not load task: ${err.message}`))
    }, [taskId])

    const saveFocus = (p: number, s: Subtask[]) =>
        fetch(`/api/tasks/${taskId}/focus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progress: p, subtasks: s }),
        }).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
        })

    const persist = (p: number, s: Subtask[]) =>
        saveFocus(p, s).catch((err: Error) => console.error('Could not save progress:', err))

    const changeProgress = (value: number) => {
        const next = Math.max(0, Math.min(100, Math.round(value)))
        setProgress(next)
        persist(next, subtasks)
    }

    const toggleSubtask = (index: number) => {
        const next = subtasks.map((s, i) => (i === index ? { ...s, done: !s.done } : s))
        setSubtasks(next)
        persist(progress, next)
    }

    const removeSubtask = (index: number) => {
        const next = subtasks.filter((_, i) => i !== index)
        setSubtasks(next)
        persist(progress, next)
    }

    const addSubtask = () => {
        const text = newStep.trim()
        if (!text) return
        const next = [...subtasks, { text, done: false }]
        setSubtasks(next)
        setNewStep('')
        persist(progress, next)
    }

    const continueLater = async () => {
        setLeaving(true)
        try {
            await saveFocus(progress, subtasks)
        } catch (err) {
            console.error('Could not save before leaving:', err)
        }
        onContinueLater()
    }

    const finish = async () => {
        setFinishing(true)
        try {
            await saveFocus(progress, subtasks)
            const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            onDone()
        } catch (err) {
            console.error('Could not finish task:', err)
            setFinishing(false)
        }
    }

    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 text-white">
                <p className="text-sm text-rose-400">{error}</p>
                <button
                    onClick={onContinueLater}
                    className="mt-4 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                >
                    ← Back
                </button>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-neutral-500">
                <p className="text-sm">Loading task…</p>
            </div>
        )
    }

    const doneCount = subtasks.filter((s) => s.done).length

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 px-6 text-white">
            <h1 className="text-5xl font-bold absolute top-6">Distracted</h1>
            <div className="w-full max-w-xl">
                <h1 className="mt-3 text-center text-4xl font-bold leading-tight">{task.label}</h1>
                <div className="mt-4 flex items-center justify-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${urgencyStyles[task.urgency]}`}>
                        {task.urgency}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${importanceStyles[task.importance]}`}>
                        {task.importance} importance
                    </span>
                </div>

                <section className="mt-10">
                    <div className="flex items-end justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            progress
                        </span>
                        <span className="text-3xl font-bold tabular-nums">
                            {progress}
                            <span className="text-lg text-neutral-500">%</span>
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={progress}
                        onChange={(e) => changeProgress(Number(e.target.value))}
                        className="mt-3 w-full accent-emerald-500"
                    />
                    <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-neutral-600">
                        <span>not started</span>
                        <span>done</span>
                    </div>
                </section>

                <section className="mt-9">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            checklist
                        </span>
                        <span className="text-xs text-neutral-600">
                            {doneCount}/{subtasks.length}
                        </span>
                    </div>

                    <ul className="mt-3 flex flex-col gap-2 max-h-96 overflow-y-auto">
                        {subtasks.map((subtask, index) => (
                            <li
                                key={index}
                                className="group flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={subtask.done}
                                    onChange={() => toggleSubtask(index)}
                                    className="size-4 shrink-0 accent-emerald-500"
                                />
                                <span
                                    className={`min-w-0 flex-1 text-sm ${subtask.done ? 'text-neutral-600 line-through' : 'text-neutral-200'
                                        }`}
                                >
                                    {subtask.text}
                                </span>
                                <button
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
                                No steps yet — break the task into smaller pieces below.
                            </li>
                        )}
                    </ul>

                    <div className="mt-3 flex gap-2">
                        <input
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addSubtask()
                            }}
                            placeholder="Add a step…"
                            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none"
                        />
                        <button
                            onClick={addSubtask}
                            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        >
                            Add
                        </button>
                    </div>
                </section>

                <div className="mt-10 flex gap-3">
                    <button
                        onClick={continueLater}
                        disabled={leaving}
                        className="flex-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                    >
                        Continue later
                    </button>
                    <button
                        onClick={finish}
                        disabled={finishing}
                        className="flex-1 rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
                    >
                        {finishing ? 'Finishing…' : 'Done'}
                    </button>
                </div>
            </div>
        </div>
    )
}
