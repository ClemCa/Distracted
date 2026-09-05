package com.clemca.distracted;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedTasks(TaskRepository tasks) {
        return args -> {
            if (tasks.count() == 0) {
                tasks.save(new Task("Finish the quarterly report", Urgency.urgent, Importance.high));
                tasks.save(new Task("Book dentist appointment", Urgency.low, Importance.medium));
                tasks.save(new Task("Review pull request", Urgency.high, Importance.medium));
                tasks.save(new Task("Plan weekend trip", Urgency.low, Importance.low));
                tasks.save(new Task("Reply to recruiter email", Urgency.medium, Importance.high));
            }
        };
    }
}
