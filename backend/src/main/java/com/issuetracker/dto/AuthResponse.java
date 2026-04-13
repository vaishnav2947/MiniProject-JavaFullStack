package com.issuetracker.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    public String token;
    public UserDTO user;
}
