import { useEffect, useState } from 'react'
import Selector from '../components/selector'
import { Task } from '../types'
import { Temporal } from '@js-temporal/polyfill';

type TaskDTO = {
    id: string
    label: string
    urgency: Task['urgency']
    importance: Task['importance']
    createdAt: string
    updatedAt: string
    delayed: boolean
    completedAt: string | null
    progress: number | null
    subtasks: { text: string; done: boolean }[]
}

const toTask = (dto: TaskDTO): Task => ({
    ...dto,
    createdAt: Temporal.Instant.from(dto.createdAt),
    updatedAt: Temporal.Instant.from(dto.updatedAt),
    completedAt: dto.completedAt ? Temporal.Instant.from(dto.completedAt) : null,
})


export default function Feed({onNow}: {onNow: (task: Task) => void}) {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [cuts, setCuts] = useState<{ [taskId: string]: number }>({});
    const urgencyWeight = 0.5;
    const importanceWeight = 0.25;
    const createdAtWeight = 0.25;
    const URGENCY_VALUES = { low: 0.25, medium: 0.5, high: 0.75, urgent: 1 };
    const IMPORTANCE_VALUES = { low: 0.34, medium: 0.67, high: 1 };

    useEffect(() => {
        fetch('/api/tasks')
            .then((res) => res.json())
            .then((data: TaskDTO[]) => setAllTasks(data.map(toTask)))
            .catch((err) => console.error('Error fetching tasks:', err))
    }, []);

    const later = (task: Task) => {
        // cut the score by 20% only for now
        setCuts((prev) => ({ ...prev, [task.id]: (prev[task.id] || 1) * 0.8 }));
    };
    const notToday = (task: Task) => {
        fetch(`/api/tasks/${task.id}/delay`, { method: 'POST' })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Error updating task');
                }
                return res.json();
            })
            .then((data: TaskDTO) => {
                const updated = toTask(data);
                setAllTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            })
            .catch((err) => console.error('Error updating task:', err));
    };

    function urgencyScore(task: Task): number {
        const urgency = URGENCY_VALUES[task.urgency];
        const importance = IMPORTANCE_VALUES[task.importance];

        const age = Temporal.Now.instant().since(task.createdAt).days;
        const recency = Math.min(1, age / 30); // the older the task the higher the score

        return (
            urgencyWeight * urgency +
            importanceWeight * importance +
            createdAtWeight * recency
        ) * (cuts[task.id] || 1);
    }

    const sortedTasks = allTasks.filter((task) => !task.delayed || task.updatedAt).sort((a, b) => urgencyScore(b) - urgencyScore(a));

    const urgentCount = sortedTasks.filter((task) => task.urgency === 'urgent').length
    const task = sortedTasks[0]

    return (
        <div className="flex flex-col gap-4">
            <Selector
                onNow={() => task && onNow(task)}
                onLater={() => task && later(task)}
                onNotToday={() => task && notToday(task)}
                task={task}
                urgentCount={urgentCount}
                />
        </div>
    )
}