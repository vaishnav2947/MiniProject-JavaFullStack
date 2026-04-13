package com.issuetracker.dto;
import com.issuetracker.entity.User;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateUserRequest {
    public String name;
    public String email;
    public User.Role role;
    public String department;
    public boolean active;
}
