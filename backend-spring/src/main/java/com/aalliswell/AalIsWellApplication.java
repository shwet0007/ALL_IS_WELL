package com.aalliswell;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class AalIsWellApplication {

    public static void main(String[] args) {
        SpringApplication.run(AalIsWellApplication.class, args);
    }
}
