package com.issuetracker.config;

import com.issuetracker.entity.User;
import com.issuetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create default admin account only if no users exist
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@issueflow.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .department("Engineering")
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("========================================");
            log.info("  Default admin account created:");
            log.info("  Email:    admin@issueflow.com");
            log.info("  Password: admin123");
            log.info("  Please change after first login!");
            log.info("========================================");
        }
    }
}
