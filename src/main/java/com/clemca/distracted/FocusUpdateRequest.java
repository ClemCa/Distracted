package com.clemca.distracted;

import java.util.List;

public record FocusUpdateRequest(Integer progress, List<SubtaskRequest> subtasks) {
}
