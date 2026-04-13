package com.issuetracker.dto;
import com.issuetracker.entity.Issue;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateIssueRequest {
    public String title;
    public String description;
    public Issue.Priority priority;
    public Issue.Type type;
    public List<String> tags;
    public LocalDateTime dueDate;
}
