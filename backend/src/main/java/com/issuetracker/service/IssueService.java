package com.issuetracker.service;

import com.issuetracker.dto.*;
import com.issuetracker.entity.*;
import com.issuetracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final IssueHistoryRepository historyRepository;
    private final MapperService mapper;

    // ─── List / Search ────────────────────────────────────────────────────────

    public Page<IssueSummaryDTO> getIssues(
            String search, String status, String priority, String type,
            int page, int size, String sortBy, String sortDir, User currentUser) {

        Issue.Status statusEnum = status != null && !status.isBlank()
                ? Issue.Status.valueOf(status.toUpperCase().replace("-", "_")) : null;
        Issue.Priority priorityEnum = priority != null && !priority.isBlank()
                ? Issue.Priority.valueOf(priority.toUpperCase()) : null;
        Issue.Type typeEnum = type != null && !type.isBlank()
                ? Issue.Type.valueOf(type.toUpperCase()) : null;

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        var spec = IssueSpecification.filter(search, statusEnum, priorityEnum, typeEnum, currentUser);
        Page<Issue> issues = issueRepository.findAll(spec, pageable);

        return issues.map(mapper::toIssueSummaryDTO);
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public IssueDTO createIssue(CreateIssueRequest request, User reporter) {
        Long maxNumber = issueRepository.findMaxIssueNumber().orElse(1000L);

        Issue issue = Issue.builder()
                .issueNumber(maxNumber + 1)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Issue.Priority.MEDIUM)
                .type(request.getType() != null ? request.getType() : Issue.Type.BUG)
                .status(Issue.Status.OPEN)
                .reporter(reporter)
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .dueDate(request.getDueDate())
                .build();

        issueRepository.save(issue);
        return mapper.toIssueDTO(issue);
    }

    // ─── Get By ID ────────────────────────────────────────────────────────────

    public IssueDTO getIssueById(Long id) {
        Issue issue = findIssue(id);
        return mapper.toIssueDTO(issue);
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public IssueDTO updateIssue(Long id, UpdateIssueRequest request, User currentUser) {
        Issue issue = findIssue(id);
        checkEditPermission(issue, currentUser);

        if (request.getTitle() != null && !request.getTitle().equals(issue.getTitle())) {
            addHistory(issue, currentUser, "title", issue.getTitle(), request.getTitle());
            issue.setTitle(request.getTitle());
        }
        if (request.getDescription() != null && !request.getDescription().equals(issue.getDescription())) {
            addHistory(issue, currentUser, "description", "updated", "updated");
            issue.setDescription(request.getDescription());
        }
        if (request.getPriority() != null && !request.getPriority().equals(issue.getPriority())) {
            addHistory(issue, currentUser, "priority", issue.getPriority().name(), request.getPriority().name());
            issue.setPriority(request.getPriority());
        }
        if (request.getType() != null && !request.getType().equals(issue.getType())) {
            addHistory(issue, currentUser, "type", issue.getType().name(), request.getType().name());
            issue.setType(request.getType());
        }
        if (request.getTags() != null) issue.setTags(request.getTags());
        if (request.getDueDate() != null) issue.setDueDate(request.getDueDate());

        issueRepository.save(issue);
        return mapper.toIssueDTO(issue);
    }

    // ─── Status Update ────────────────────────────────────────────────────────

    @Transactional
    public IssueDTO updateStatus(Long id, Issue.Status newStatus, User currentUser) {
        Issue issue = findIssue(id);

        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        boolean isAssignee = issue.getAssignee() != null
                && issue.getAssignee().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignee) {
            throw new RuntimeException("Not authorized to change status.");
        }

        addHistory(issue, currentUser, "status", issue.getStatus().name(), newStatus.name());
        issue.setStatus(newStatus);

        if (newStatus == Issue.Status.RESOLVED && issue.getResolvedAt() == null) {
            issue.setResolvedAt(LocalDateTime.now());
        }
        if (newStatus == Issue.Status.CLOSED && issue.getClosedAt() == null) {
            issue.setClosedAt(LocalDateTime.now());
        }

        issueRepository.save(issue);
        return mapper.toIssueDTO(issue);
    }

    // ─── Assign ───────────────────────────────────────────────────────────────

    @Transactional
    public IssueDTO assignIssue(Long id, Long assigneeId, User currentUser) {
        Issue issue = findIssue(id);
        String oldAssignee = issue.getAssignee() != null ? issue.getAssignee().getName() : "unassigned";

        // Decrement old assignee workload
        if (issue.getAssignee() != null) {
            User prev = issue.getAssignee();
            prev.setAssignedIssuesCount(Math.max(0, prev.getAssignedIssuesCount() - 1));
            userRepository.save(prev);
        }

        if (assigneeId != null) {
            User newAssignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Developer not found."));
            issue.setAssignee(newAssignee);
            if (issue.getStatus() == Issue.Status.OPEN) {
                issue.setStatus(Issue.Status.IN_PROGRESS);
            }
            newAssignee.setAssignedIssuesCount(newAssignee.getAssignedIssuesCount() + 1);
            userRepository.save(newAssignee);
            addHistory(issue, currentUser, "assignee", oldAssignee, newAssignee.getName());
        } else {
            issue.setAssignee(null);
            if (issue.getStatus() == Issue.Status.IN_PROGRESS) {
                issue.setStatus(Issue.Status.OPEN);
            }
            addHistory(issue, currentUser, "assignee", oldAssignee, "unassigned");
        }

        issueRepository.save(issue);
        return mapper.toIssueDTO(issue);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteIssue(Long id, User currentUser) {
        Issue issue = findIssue(id);
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());

        if (!isAdmin && !isReporter) {
            throw new RuntimeException("Not authorized to delete this issue.");
        }

        if (issue.getAssignee() != null) {
            User assignee = issue.getAssignee();
            assignee.setAssignedIssuesCount(Math.max(0, assignee.getAssignedIssuesCount() - 1));
            userRepository.save(assignee);
        }

        issueRepository.delete(issue);
    }

    // ─── Comments ─────────────────────────────────────────────────────────────

    @Transactional
    public List<CommentDTO> addComment(Long issueId, String text, User currentUser) {
        Issue issue = findIssue(issueId);
        Comment comment = Comment.builder()
                .issue(issue)
                .user(currentUser)
                .text(text)
                .build();
        commentRepository.save(comment);
        return commentRepository.findByIssueOrderByCreatedAtAsc(issue)
                .stream().map(mapper::toCommentDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long issueId, Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found."));

        boolean isOwner = comment.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Not authorized to delete this comment.");
        }
        commentRepository.delete(comment);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Issue findIssue(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found."));
    }

    private void checkEditPermission(Issue issue, User currentUser) {
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());
        boolean isAssignee = issue.getAssignee() != null
                && issue.getAssignee().getId().equals(currentUser.getId());
        if (!isAdmin && !isReporter && !isAssignee) {
            throw new RuntimeException("Not authorized to edit this issue.");
        }
    }

    private void addHistory(Issue issue, User changedBy, String field, String oldVal, String newVal) {
        IssueHistory history = IssueHistory.builder()
                .issue(issue)
                .changedBy(changedBy)
                .fieldName(field)
                .oldValue(oldVal)
                .newValue(newVal)
                .build();
        historyRepository.save(history);
        issue.getHistory().add(history);
    }
}
