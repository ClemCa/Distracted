import { Temporal } from "@js-temporal/polyfill";

export type Task = {
    id: string,
    label: string,
    urgency: "low" | "medium" | "high" | "urgent",
    importance: "low" | "medium" | "high",
    createdAt: Temporal.Instant,
    updatedAt: Temporal.Instant,
    delayed: boolean,
    completedAt: Temporal.Instant | null,
}