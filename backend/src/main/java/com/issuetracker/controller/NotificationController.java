package com.issuetracker.controller;

import com.issuetracker.entity.User;
import com.issuetracker.repository.UserRepository;
import com.issuetracker.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    // GET /api/notifications
    @GetMapping
    public ResponseEntity<?> getAll(@AuthenticationPrincipal UserDetails ud) {
        var notifications = notificationService.getAll(getUser(ud));
        return ResponseEntity.ok(Map.of(
                "success", true,
                "notifications", notifications,
                "unreadCount", notifications.stream().filter(n -> !n.isRead()).count()
        ));
    }

    // GET /api/notifications/count
    @GetMapping("/count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserDetails ud) {
        long count = notificationService.getUnreadCount(getUser(ud));
        return ResponseEntity.ok(Map.of("success", true, "unreadCount", count));
    }

    // PUT /api/notifications/:id/read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        notificationService.markRead(id, getUser(ud));
        return ResponseEntity.ok(Map.of("success", true, "message", "Notification marked as read."));
    }

    // PUT /api/notifications/read-all
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        notificationService.markAllRead(getUser(ud));
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read."));
    }
}
