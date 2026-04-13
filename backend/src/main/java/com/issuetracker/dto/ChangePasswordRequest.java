package com.issuetracker.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank public String currentPassword;
    @NotBlank @Size(min=6) public String newPassword;
}
