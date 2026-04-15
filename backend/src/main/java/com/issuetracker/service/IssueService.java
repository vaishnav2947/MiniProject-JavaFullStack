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
    private final NotificationService notificationService;
    private final MapperService mapper;

    // ─── List ─────────────────────────────────────────────────────────────────
    public Page<IssueSummaryDTO> getIssues(
            String search, String status, String priority, String type,
            int page, int size, String sortBy, String sortDir, User currentUser) {

        Issue.Status statusEnum = parse(status, Issue.Status.class);
        Issue.Priority priorityEnum = parse(priority, Issue.Priority.class);
        Issue.Type typeEnum = parse(type, Issue.Type.class);

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size, sort);

        var spec = IssueSpecification.filter(search, statusEnum, priorityEnum, typeEnum, currentUser);
        return issueRepository.findAll(spec, pageable).map(mapper::toIssueSummaryDTO);
    }

    // ─── Create ───────────────────────────────────────────────────────────────
    @Transactional
    public IssueDTO createIssue(CreateIssueRequest request, User reporter) {
        if (request.getTitle() == null || request.getTitle().isBlank())
            throw new RuntimeException("Title is required.");
        if (request.getDescription() == null || request.getDescription().isBlank())
            throw new RuntimeException("Description is required.");

        Long maxNumber = issueRepository.findMaxIssueNumber().orElse(1000L);

        Issue issue = Issue.builder()
                .issueNumber(maxNumber + 1)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .priority(request.getPriority() != null ? request.getPriority() : Issue.Priority.MEDIUM)
                .type(request.getType() != null ? request.getType() : Issue.Type.BUG)
                .status(Issue.Status.OPEN)
                .reporter(reporter)
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .dueDate(request.getDueDate())
                .build();

        issueRepository.save(issue);
        return mapper.toIssueDTO(issueRepository.findById(issue.getId()).orElse(issue));
    }

    // ─── Get By ID ────────────────────────────────────────────────────────────
    public IssueDTO getIssueById(Long id) {
        return mapper.toIssueDTO(findIssue(id));
    }

    // ─── Update ───────────────────────────────────────────────────────────────
    @Transactional
    public IssueDTO updateIssue(Long id, UpdateIssueRequest request, User currentUser) {
        Issue issue = findIssue(id);
        checkEditPermission(issue, currentUser);

        if (request.getTitle() != null && !request.getTitle().isBlank()
                && !request.getTitle().equals(issue.getTitle())) {
            addHistory(issue, currentUser, "title", issue.getTitle(), request.getTitle());
            issue.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()
                && !request.getDescription().equals(issue.getDescription())) {
            addHistory(issue, currentUser, "description", "updated", "updated");
            issue.setDescription(request.getDescription().trim());
        }
        if (request.getPriority() != null && !request.getPriority().equals(issue.getPriority())) {
            addHistory(issue, currentUser, "priority",
                    issue.getPriority().name(), request.getPriority().name());
            issue.setPriority(request.getPriority());
        }
        if (request.getType() != null && !request.getType().equals(issue.getType())) {
            addHistory(issue, currentUser, "type",
                    issue.getType().name(), request.getType().name());
            issue.setType(request.getType());
        }
        if (request.getTags() != null)   issue.setTags(request.getTags());
        if (request.getDueDate() != null) issue.setDueDate(request.getDueDate());

        issueRepository.save(issue);
        return mapper.toIssueDTO(findIssue(id));
    }

    // ─── Status Update ────────────────────────────────────────────────────────
    @Transactional
    public IssueDTO updateStatus(Long id, Issue.Status newStatus, User currentUser) {
        Issue issue = findIssue(id);
        boolean isAdmin    = currentUser.getRole() == User.Role.ADMIN;
        boolean isAssignee = issue.getAssignee() != null
                && issue.getAssignee().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignee)
            throw new RuntimeException("Only the assignee or admin can change status.");

        String oldStatus = issue.getStatus().name();
        addHistory(issue, currentUser, "status", oldStatus, newStatus.name());
        issue.setStatus(newStatus);

        if (newStatus == Issue.Status.RESOLVED && issue.getResolvedAt() == null)
            issue.setResolvedAt(LocalDateTime.now());
        if (newStatus == Issue.Status.CLOSED && issue.getClosedAt() == null)
            issue.setClosedAt(LocalDateTime.now());

        issueRepository.save(issue);

        // Notify reporter and assignee
        notificationService.notifyStatusChanged(issue, currentUser, oldStatus, newStatus.name());

        return mapper.toIssueDTO(findIssue(id));
    }

    // ─── Assign ───────────────────────────────────────────────────────────────
    @Transactional
    public IssueDTO assignIssue(Long id, Long assigneeId, User currentUser) {
        Issue issue = findIssue(id);
        String oldAssignee = issue.getAssignee() != null
                ? issue.getAssignee().getName() : "unassigned";

        // Decrement old assignee count
        if (issue.getAssignee() != null) {
            User prev = issue.getAssignee();
            prev.setAssignedIssuesCount(Math.max(0, prev.getAssignedIssuesCount() - 1));
            userRepository.save(prev);
        }

        if (assigneeId != null) {
            User newAssignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Developer not found."));
            issue.setAssignee(newAssignee);
            if (issue.getStatus() == Issue.Status.OPEN)
                issue.setStatus(Issue.Status.IN_PROGRESS);
            newAssignee.setAssignedIssuesCount(newAssignee.getAssignedIssuesCount() + 1);
            userRepository.save(newAssignee);
            addHistory(issue, currentUser, "assignee", oldAssignee, newAssignee.getName());

            issueRepository.save(issue);
            // Notify new assignee
            notificationService.notifyAssigned(issue, currentUser);
        } else {
            issue.setAssignee(null);
            if (issue.getStatus() == Issue.Status.IN_PROGRESS)
                issue.setStatus(Issue.Status.OPEN);
            addHistory(issue, currentUser, "assignee", oldAssignee, "unassigned");
            issueRepository.save(issue);
        }

        return mapper.toIssueDTO(findIssue(id));
    }

    // ─── Delete ───────────────────────────────────────────────────────────────
    @Transactional
    public void deleteIssue(Long id, User currentUser) {
        Issue issue = findIssue(id);
        boolean isAdmin    = currentUser.getRole() == User.Role.ADMIN;
        boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());
        if (!isAdmin && !isReporter)
            throw new RuntimeException("Not authorized to delete this issue.");
        if (issue.getAssignee() != null) {
            User a = issue.getAssignee();
            a.setAssignedIssuesCount(Math.max(0, a.getAssignedIssuesCount() - 1));
            userRepository.save(a);
        }
        issueRepository.delete(issue);
    }

    // ─── Comments ─────────────────────────────────────────────────────────────
    @Transactional
    public List<CommentDTO> addComment(Long issueId, String text, User currentUser) {
        if (text == null || text.isBlank())
            throw new RuntimeException("Comment text cannot be empty.");
        Issue issue = findIssue(issueId);
        Comment comment = Comment.builder()
                .issue(issue).user(currentUser).text(text.trim()).build();
        commentRepository.save(comment);

        // Notify reporter & assignee
        notificationService.notifyCommented(issue, currentUser);

        return commentRepository.findByIssueOrderByCreatedAtAsc(issue)
                .stream().map(mapper::toCommentDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long issueId, Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found."));
        boolean isOwner = comment.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin)
            throw new RuntimeException("Not authorized to delete this comment.");
        commentRepository.delete(comment);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────
    private Issue findIssue(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue #" + id + " not found."));
    }

    private void checkEditPermission(Issue issue, User currentUser) {
        boolean isAdmin    = currentUser.getRole() == User.Role.ADMIN;
        boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());
        boolean isAssignee = issue.getAssignee() != null
                && issue.getAssignee().getId().equals(currentUser.getId());
        if (!isAdmin && !isReporter && !isAssignee)
            throw new RuntimeException("Not authorized to edit this issue.");
    }

    private void addHistory(Issue issue, User changedBy, String field,
                            String oldVal, String newVal) {
        IssueHistory h = IssueHistory.builder()
                .issue(issue).changedBy(changedBy)
                .fieldName(field).oldValue(oldVal).newValue(newVal).build();
        historyRepository.save(h);
        issue.getHistory().add(h);
    }

    private <T extends Enum<T>> T parse(String value, Class<T> enumClass) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(enumClass, value.toUpperCase().replace("-", "_"));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
