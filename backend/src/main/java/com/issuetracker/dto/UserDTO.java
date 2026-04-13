package com.issuetracker.dto;
import com.issuetracker.entity.User;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDTO {
    public Long id;
    public String name;
    public String email;
    public User.Role role;
    public String department;
    public boolean active;
    public int assignedIssuesCount;
    public LocalDateTime createdAt;
}
