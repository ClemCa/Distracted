import { Temporal } from "@js-temporal/polyfill";

export type Urgency = "low" | "medium" | "high" | "urgent"
export type Importance = "low" | "medium" | "high"

export type Task = {
    id: string,
    label: string,
    urgency: Urgency,
    importance: Importance,
    createdAt: Temporal.Instant,
    updatedAt: Temporal.Instant,
    delayed: boolean,
    completedAt: Temporal.Instant | null,
}
export type ClemSsoUser = {
  sub?: string
  email?: string
  name?: string
  picture?: string
}