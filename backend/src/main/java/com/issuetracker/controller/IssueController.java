package com.issuetracker.controller;

import com.issuetracker.dto.*;
import com.issuetracker.entity.Issue;
import com.issuetracker.entity.User;
import com.issuetracker.repository.UserRepository;
import com.issuetracker.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final UserRepository userRepository;

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    // GET /api/issues  (paginated, filtered)
    @GetMapping
    public ResponseEntity<?> getIssues(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1")    int page,
            @RequestParam(defaultValue = "12")   int limit,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getUser(userDetails);
        Page<IssueSummaryDTO> result = issueService.getIssues(
                search, status, priority, type, page, limit, sortBy, sortOrder, currentUser);

        return ResponseEntity.ok(Map.of(
                "success",     true,
                "count",       result.getNumberOfElements(),
                "total",       result.getTotalElements(),
                "pages",       result.getTotalPages(),
                "currentPage", page,
                "issues",      result.getContent()
        ));
    }

    // POST /api/issues
    @PostMapping
    public ResponseEntity<?> createIssue(
            @Valid @RequestBody CreateIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueDTO issue = issueService.createIssue(request, getUser(userDetails));
        return ResponseEntity.status(201).body(Map.of("success", true, "issue", issue));
    }

    // GET /api/issues/:id
    @GetMapping("/{id}")
    public ResponseEntity<?> getIssue(@PathVariable Long id) {
        IssueDTO issue = issueService.getIssueById(id);
        return ResponseEntity.ok(Map.of("success", true, "issue", issue));
    }

    // PUT /api/issues/:id
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIssue(
            @PathVariable Long id,
            @RequestBody UpdateIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueDTO issue = issueService.updateIssue(id, request, getUser(userDetails));
        return ResponseEntity.ok(Map.of("success", true, "issue", issue));
    }

    // PUT /api/issues/:id/status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueDTO issue = issueService.updateStatus(id, request.getStatus(), getUser(userDetails));
        return ResponseEntity.ok(Map.of("success", true, "issue", issue));
    }

    // PUT /api/issues/:id/assign  (admin only)
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignIssue(
            @PathVariable Long id,
            @RequestBody AssignIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUser(userDetails);
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admins can assign issues.");
        }
        IssueDTO issue = issueService.assignIssue(id, request.getAssigneeId(), currentUser);
        return ResponseEntity.ok(Map.of("success", true, "issue", issue));
    }

    // POST /api/issues/:id/comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<CommentDTO> comments = issueService.addComment(id, request.getText(), getUser(userDetails));
        return ResponseEntity.ok(Map.of("success", true, "comments", comments));
    }

    // DELETE /api/issues/:id/comments/:commentId
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        issueService.deleteComment(id, commentId, getUser(userDetails));
        return ResponseEntity.ok(Map.of("success", true, "message", "Comment deleted."));
    }

    // DELETE /api/issues/:id
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        issueService.deleteIssue(id, getUser(userDetails));
        return ResponseEntity.ok(Map.of("success", true, "message", "Issue deleted successfully."));
    }
}
