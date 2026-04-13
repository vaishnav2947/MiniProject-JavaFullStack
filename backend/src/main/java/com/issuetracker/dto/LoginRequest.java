package com.issuetracker.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    @Email @NotBlank public String email;
    @NotBlank public String password;
}
