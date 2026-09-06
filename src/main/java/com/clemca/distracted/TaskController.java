package com.clemca.distracted;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository tasks;

    public TaskController(TaskRepository tasks) {
        this.tasks = tasks;
    }

    @GetMapping
    public List<Task> list() {
        return tasks.findAll();
    }

    @GetMapping("/{id}")
    public Task get(@PathVariable String id) {
        return tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        Task task = tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        tasks.delete(task);
    }

    @PostMapping
    public Task create(@RequestBody CreateTaskRequest request) {
        Task task = new Task(request.label(), request.urgency(), request.importance());
        task.setDescription(request.description());
        task.setProject(request.project());
        if (request.dependencies() != null) {
            task.setDependencies(request.dependencies());
        }
        if (request.subtasks() != null) {
            task.setSubtasks(toSubtasks(request.subtasks()));
        }
        return tasks.save(task);
    }

    @PostMapping ("/{id}/update")
    public Task update(@PathVariable String id, @RequestBody CreateTaskRequest request) {
        Task task = tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        task.setLabel(request.label());
        task.setUrgency(request.urgency());
        task.setImportance(request.importance());
        task.setDescription(request.description());
        task.setProject(request.project());
        if (request.dependencies() != null) {
            task.setDependencies(request.dependencies());
        }
        if (request.subtasks() != null) {
            task.setSubtasks(toSubtasks(request.subtasks()));
        }
        task.setUpdatedAt(Instant.now());
        return tasks.save(task);
    }

    @PostMapping("/{id}/complete")
    public Task complete(@PathVariable String id) {
        Task task = tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        task.setCompletedAt(Instant.now());
        task.setUpdatedAt(Instant.now());
        task.setProgress(100);
        task.getSubtasks().forEach(s -> s.setDone(true));
        return tasks.save(task);
    }

    @PostMapping("/{id}/delay")
    public Task delay(@PathVariable String id) {
        Task task = tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        task.setDelayed(true);
        task.setUpdatedAt(Instant.now());
        return tasks.save(task);
    }

    @PostMapping("/{id}/focus")
    public Task updateFocus(@PathVariable String id, @RequestBody FocusUpdateRequest request) {
        Task task = tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        if (request.progress() != null) {
            task.setProgress(Math.max(0, Math.min(100, request.progress())));
        }
        if (request.subtasks() != null) {
            task.setSubtasks(toSubtasks(request.subtasks()));
        }
        task.setUpdatedAt(Instant.now());
        return tasks.save(task);
    }

    private List<Subtask> toSubtasks(List<SubtaskRequest> requests) {
        List<Subtask> subtasks = new ArrayList<>();
        for (SubtaskRequest s : requests) {
            subtasks.add(new Subtask(s.text(), s.done()));
        }
        return subtasks;
    }
}
