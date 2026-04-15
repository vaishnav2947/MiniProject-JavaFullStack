package com.issuetracker.service;

import com.issuetracker.dto.NotificationDTO;
import com.issuetracker.entity.*;
import com.issuetracker.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MapperService mapper;

    // ── Create notification ───────────────────────────────────────────────────
    public void create(User recipient, User actor, Issue issue,
                       Notification.NotificationType type, String message) {
        if (recipient == null || recipient.getId().equals(actor != null ? actor.getId() : -1L)) {
            return; // Don't notify yourself
        }
        Notification n = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .issue(issue)
                .type(type)
                .message(message)
                .read(false)
                .build();
        notificationRepository.save(n);
    }

    // ── Notify assignee when issue is assigned ────────────────────────────────
    public void notifyAssigned(Issue issue, User actor) {
        if (issue.getAssignee() != null) {
            create(issue.getAssignee(), actor, issue,
                Notification.NotificationType.ISSUE_ASSIGNED,
                actor.getName() + " assigned you to: \"" + issue.getTitle() + "\"");
        }
    }

    // ── Notify reporter when status changes ────────────────────────────────────
    public void notifyStatusChanged(Issue issue, User actor, String oldStatus, String newStatus) {
        if (issue.getReporter() != null && !issue.getReporter().getId().equals(actor.getId())) {
            create(issue.getReporter(), actor, issue,
                Notification.NotificationType.ISSUE_STATUS_CHANGED,
                actor.getName() + " changed status of \"" + issue.getTitle()
                    + "\" from " + oldStatus + " to " + newStatus);
        }
        if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(actor.getId())) {
            create(issue.getAssignee(), actor, issue,
                Notification.NotificationType.ISSUE_STATUS_CHANGED,
                actor.getName() + " changed status of \"" + issue.getTitle()
                    + "\" from " + oldStatus + " to " + newStatus);
        }
    }

    // ── Notify on new comment ─────────────────────────────────────────────────
    public void notifyCommented(Issue issue, User actor) {
        if (issue.getReporter() != null) {
            create(issue.getReporter(), actor, issue,
                Notification.NotificationType.ISSUE_COMMENTED,
                actor.getName() + " commented on \"" + issue.getTitle() + "\"");
        }
        if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(issue.getReporter().getId())) {
            create(issue.getAssignee(), actor, issue,
                Notification.NotificationType.ISSUE_COMMENTED,
                actor.getName() + " commented on \"" + issue.getTitle() + "\"");
        }
    }

    // ── Get all notifications for user ────────────────────────────────────────
    public List<NotificationDTO> getAll(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Get unread count ──────────────────────────────────────────────────────
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    // ── Mark single as read ───────────────────────────────────────────────────
    @Transactional
    public void markRead(Long id, User user) {
        notificationRepository.markReadById(id, user);
    }

    // ── Mark all as read ──────────────────────────────────────────────────────
    @Transactional
    public void markAllRead(User user) {
        notificationRepository.markAllReadByRecipient(user);
    }

    // ── Convert to DTO ────────────────────────────────────────────────────────
    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .actor(n.getActor() != null ? mapper.toUserDTO(n.getActor()) : null)
                .issueId(n.getIssue() != null ? n.getIssue().getId() : null)
                .issueNumber(n.getIssue() != null ? n.getIssue().getIssueNumber() : null)
                .issueTitle(n.getIssue() != null ? n.getIssue().getTitle() : null)
                .type(n.getType())
                .message(n.getMessage())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
