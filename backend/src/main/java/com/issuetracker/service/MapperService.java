package com.issuetracker.service;

import com.issuetracker.dto.*;
import com.issuetracker.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MapperService {

    public UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .active(user.isActive())
                .assignedIssuesCount(user.getAssignedIssuesCount())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public CommentDTO toCommentDTO(Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .user(toUserDTO(comment.getUser()))
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public HistoryDTO toHistoryDTO(IssueHistory h) {
        return HistoryDTO.builder()
                .id(h.getId())
                .changedBy(toUserDTO(h.getChangedBy()))
                .fieldName(h.getFieldName())
                .oldValue(h.getOldValue())
                .newValue(h.getNewValue())
                .changedAt(h.getChangedAt())
                .build();
    }

    public IssueDTO toIssueDTO(Issue issue) {
        List<CommentDTO> comments = issue.getComments() == null ? List.of() :
                issue.getComments().stream().map(this::toCommentDTO).collect(Collectors.toList());

        List<HistoryDTO> history = issue.getHistory() == null ? List.of() :
                issue.getHistory().stream().map(this::toHistoryDTO).collect(Collectors.toList());

        return IssueDTO.builder()
                .id(issue.getId())
                .issueNumber(issue.getIssueNumber())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .type(issue.getType())
                .reporter(toUserDTO(issue.getReporter()))
                .assignee(toUserDTO(issue.getAssignee()))
                .tags(issue.getTags())
                .dueDate(issue.getDueDate())
                .resolvedAt(issue.getResolvedAt())
                .closedAt(issue.getClosedAt())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .comments(comments)
                .history(history)
                .build();
    }

    public IssueSummaryDTO toIssueSummaryDTO(Issue issue) {
        return IssueSummaryDTO.builder()
                .id(issue.getId())
                .issueNumber(issue.getIssueNumber())
                .title(issue.getTitle())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .type(issue.getType())
                .reporter(toUserDTO(issue.getReporter()))
                .assignee(toUserDTO(issue.getAssignee()))
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
