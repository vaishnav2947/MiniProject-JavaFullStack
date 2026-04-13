package com.issuetracker.dto;

import com.issuetracker.entity.Issue;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IssueSummaryDTO {
    public Long id;
    public Long issueNumber;
    public String title;
    public Issue.Priority priority;
    public Issue.Status status;
    public Issue.Type type;
    public UserDTO reporter;
    public UserDTO assignee;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
