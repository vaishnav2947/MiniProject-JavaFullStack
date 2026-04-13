package com.issuetracker.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentDTO {
    public Long id;
    public UserDTO user;
    public String text;
    public LocalDateTime createdAt;
}
