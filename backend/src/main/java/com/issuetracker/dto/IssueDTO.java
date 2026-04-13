package com.issuetracker.dto;
import com.issuetracker.entity.Issue;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IssueDTO {
    public Long id;
    public Long issueNumber;
    public String title;
    public String description;
    public Issue.Priority priority;
    public Issue.Status status;
    public Issue.Type type;
    public UserDTO reporter;
    public UserDTO assignee;
    public List<String> tags;
    public LocalDateTime dueDate;
    public LocalDateTime resolvedAt;
    public LocalDateTime closedAt;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public List<CommentDTO> comments;
    public List<HistoryDTO> history;
}
