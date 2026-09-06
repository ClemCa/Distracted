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
        return tasks.save(new Task(request.label(), request.urgency(), request.importance()));
    }

    @PostMapping ("/{id}/update")
    public Task update(@PathVariable String id, @RequestBody CreateTaskRequest request) {
        Task task = tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        task.setLabel(request.label());
        task.setUrgency(request.urgency());
        task.setImportance(request.importance());
        task.setUpdatedAt(Instant.now());
        return tasks.save(task);
    }

    @PostMapping("/{id}/complete")
    public Task complete(@PathVariable String id) {
        Task task = tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        task.setCompletedAt(Instant.now());
        task.setUpdatedAt(Instant.now());
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
}
