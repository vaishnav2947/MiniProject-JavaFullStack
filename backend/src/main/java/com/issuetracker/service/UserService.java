package com.issuetracker.service;

import com.issuetracker.dto.UpdateUserRequest;
import com.issuetracker.dto.UserDTO;
import com.issuetracker.entity.User;
import com.issuetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MapperService mapper;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(mapper::toUserDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getDevelopers() {
        return userRepository
                .findByRoleInAndActiveTrue(List.of(User.Role.DEVELOPER, User.Role.ADMIN))
                .stream()
                .map(mapper::toUserDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));
        return mapper.toUserDTO(user);
    }

    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        user.setActive(request.isActive());

        userRepository.save(user);
        return mapper.toUserDTO(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));
        userRepository.delete(user);
    }
}
