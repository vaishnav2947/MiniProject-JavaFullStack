package com.issuetracker.dto;
import com.issuetracker.entity.Issue;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateStatusRequest {
    public Issue.Status status;
}
