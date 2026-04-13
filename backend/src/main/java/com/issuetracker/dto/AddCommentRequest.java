package com.issuetracker.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class AddCommentRequest {
    @NotBlank public String text;
}
