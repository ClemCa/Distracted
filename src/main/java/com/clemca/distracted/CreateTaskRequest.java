package com.clemca.distracted;

import java.util.List;

public record CreateTaskRequest(
        String label,
        String description,
        Urgency urgency,
        Importance importance,
        String project,
        List<String> dependencies,
        List<SubtaskRequest> subtasks,
        DeferStatus status) {
}
