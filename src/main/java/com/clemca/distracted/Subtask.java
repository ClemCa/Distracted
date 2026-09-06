package com.clemca.distracted;

import jakarta.persistence.Embeddable;

@Embeddable
public class Subtask {

    private String text;

    private boolean done;

    protected Subtask() {
    }

    public Subtask(String text, boolean done) {
        this.text = text;
        this.done = done;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }
}
