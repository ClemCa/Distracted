package com.clemca.distracted;

public record CreateTaskRequest(String label, Urgency urgency, Importance importance) {
}
