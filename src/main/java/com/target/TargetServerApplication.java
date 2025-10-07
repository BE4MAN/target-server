package com.target;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TargetServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TargetServerApplication.class, args);
    }

}
