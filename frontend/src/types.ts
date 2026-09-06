import { Temporal } from "@js-temporal/polyfill";

export type Urgency = "low" | "medium" | "high" | "urgent"
export type Importance = "low" | "medium" | "high"

export type Subtask = {
    text: string
    done: boolean
}

export type Task = {
    id: string,
    label: string,
    description: string | null,
    urgency: Urgency,
    importance: Importance,
    project: string | null,
    createdAt: Temporal.Instant,
    updatedAt: Temporal.Instant,
    delayed: boolean,
    completedAt: Temporal.Instant | null,
    progress: number | null,
    dependencies: string[],
    subtasks: Subtask[],
}
export type ClemSsoUser = {
  sub?: string
  email?: string
  name?: string
  picture?: string
}