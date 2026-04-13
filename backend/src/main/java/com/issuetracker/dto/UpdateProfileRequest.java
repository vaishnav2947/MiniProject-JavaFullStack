package com.issuetracker.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    public String name;
    public String department;
}
