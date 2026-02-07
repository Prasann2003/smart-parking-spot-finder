package com.smartparking;

import com.smartparking.entity.Role;
import com.smartparking.entity.User;
import com.smartparking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SmartParkingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartParkingBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@smartparking.com")) {
                User admin = User.builder()
                        .name("Admin User")
                        .email("admin@smartparking.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .build();
                userRepository.save(admin);
                System.out.println("✅ Admin user created: admin@smartparking.com / admin123");
            }
        };
    }
}
