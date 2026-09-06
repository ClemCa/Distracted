package com.clemca.distracted;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final TaskRepository tasks;

    public ProjectController(TaskRepository tasks) {
        this.tasks = tasks;
    }

    @GetMapping
    public List<String> list() {
        List<String> projects = new ArrayList<>();
        for (Task task : tasks.findAll()) {
            String project = task.getProject();
            if (project == null || project.isBlank()) {
                continue;
            }
            String trimmed = project.trim();
            if (!projects.contains(trimmed)) {
                projects.add(trimmed);
            }
        }
        projects.sort(String.CASE_INSENSITIVE_ORDER);
        return projects;
    }
}
