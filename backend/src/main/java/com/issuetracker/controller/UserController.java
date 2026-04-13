package com.issuetracker.controller;

import com.issuetracker.dto.UpdateUserRequest;
import com.issuetracker.dto.UserDTO;
import com.issuetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users  (admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(Map.of("success", true, "count", users.size(), "users", users));
    }

    // GET /api/users/developers  (any authenticated user)
    @GetMapping("/developers")
    public ResponseEntity<?> getDevelopers() {
        List<UserDTO> developers = userService.getDevelopers();
        return ResponseEntity.ok(Map.of("success", true, "developers", developers));
    }

    // GET /api/users/:id
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }

    // PUT /api/users/:id  (admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        UserDTO user = userService.updateUser(id, request);
        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }

    // DELETE /api/users/:id  (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully."));
    }
}
