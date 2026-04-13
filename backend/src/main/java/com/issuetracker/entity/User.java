package com.issuetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.REPORTER;

    @Column(length = 100)
    private String department;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "assigned_issues_count")
    private int assignedIssuesCount = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "reporter", fetch = FetchType.LAZY)
    private List<Issue> reportedIssues;

    @OneToMany(mappedBy = "assignee", fetch = FetchType.LAZY)
    private List<Issue> assignedIssues;

    public enum Role {
        ADMIN, DEVELOPER, REPORTER
    }
}
