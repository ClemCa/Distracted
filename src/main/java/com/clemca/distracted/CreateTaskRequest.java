package com.clemca.distracted;

import java.util.List;

public record CreateTaskRequest(String label, Urgency urgency, Importance importance, List<SubtaskRequest> subtasks) {
}
