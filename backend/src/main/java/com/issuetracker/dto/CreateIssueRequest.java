package com.issuetracker.dto;
import com.issuetracker.entity.Issue;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor
public class CreateIssueRequest {
    @NotBlank public String title;
    @NotBlank public String description;
    public Issue.Priority priority = Issue.Priority.MEDIUM;
    public Issue.Type type = Issue.Type.BUG;
    public List<String> tags;
    public LocalDateTime dueDate;
}
