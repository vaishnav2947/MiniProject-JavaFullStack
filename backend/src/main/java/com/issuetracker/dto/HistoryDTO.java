package com.issuetracker.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class HistoryDTO {
    public Long id;
    public UserDTO changedBy;
    public String fieldName;
    public String oldValue;
    public String newValue;
    public LocalDateTime changedAt;
}
