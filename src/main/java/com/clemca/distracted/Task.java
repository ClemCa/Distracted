package com.clemca.distracted;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Urgency urgency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Importance importance;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DeferStatus status;

    private Instant completedAt;

    private Integer progress;

    @Column(length = 2000)
    private String description;

    private String project;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "task_dependencies", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "dependency_id")
    private List<String> dependencies = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn(name = "position")
    private List<Subtask> subtasks = new ArrayList<>();

    protected Task() {
    }

    public Task(String label, Urgency urgency, Importance importance) {
        this.id = UUID.randomUUID().toString();
        this.label = label;
        this.urgency = urgency;
        this.importance = importance;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
        this.status = DeferStatus.none;
        this.completedAt = null;
        this.progress = 0;
        this.subtasks = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Urgency getUrgency() {
        return urgency;
    }

    public void setUrgency(Urgency urgency) {
        this.urgency = urgency;
    }

    public Importance getImportance() {
        return importance;
    }

    public void setImportance(Importance importance) {
        this.importance = importance;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public DeferStatus getStatus() {
        return status == null ? DeferStatus.none : status;
    }

    public void setStatus(DeferStatus status) {
        this.status = status;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public List<String> getDependencies() {
        return dependencies;
    }

    public void setDependencies(List<String> dependencies) {
        this.dependencies = dependencies;
    }

    public List<Subtask> getSubtasks() {
        return subtasks;
    }

    public void setSubtasks(List<Subtask> subtasks) {
        this.subtasks = subtasks;
    }
}
