package com.issuetracker.dto;

import com.issuetracker.entity.Notification;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDTO {
    public Long id;
    public UserDTO actor;
    public Long issueId;
    public Long issueNumber;
    public String issueTitle;
    public Notification.NotificationType type;
    public String message;
    public boolean read;
    public LocalDateTime createdAt;
}
