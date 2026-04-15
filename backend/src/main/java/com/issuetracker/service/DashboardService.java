package com.issuetracker.service;

import com.issuetracker.dto.IssueSummaryDTO;
import com.issuetracker.dto.UserDTO;
import com.issuetracker.entity.Issue;
import com.issuetracker.entity.User;
import com.issuetracker.repository.IssueRepository;
import com.issuetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final MapperService mapper;

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(User currentUser) {
        boolean isAdmin    = currentUser.getRole() == User.Role.ADMIN;
        boolean isDeveloper = currentUser.getRole() == User.Role.DEVELOPER;

        Map<String, Object> stats = new LinkedHashMap<>();

        if (isAdmin) {
            stats.put("totalIssues",        issueRepository.count());
            stats.put("openIssues",         issueRepository.countByStatus(Issue.Status.OPEN));
            stats.put("inProgressIssues",   issueRepository.countByStatus(Issue.Status.IN_PROGRESS));
            stats.put("resolvedIssues",     issueRepository.countByStatus(Issue.Status.RESOLVED));
            stats.put("closedIssues",       issueRepository.countByStatus(Issue.Status.CLOSED));
            stats.put("highPriorityIssues", issueRepository.countByPriority(Issue.Priority.HIGH));
            stats.put("criticalIssues",     issueRepository.countByPriority(Issue.Priority.CRITICAL));
            long totalUsers  = userRepository.count();
            long activeUsers = userRepository.findAll().stream().filter(User::isActive).count();
            stats.put("totalUsers",  totalUsers);
            stats.put("activeUsers", activeUsers);
        } else if (isDeveloper) {
            stats.put("totalIssues",        issueRepository.countByReporterOrAssignee(currentUser));
            stats.put("openIssues",         issueRepository.countByStatusAndAssignee(Issue.Status.OPEN, currentUser));
            stats.put("inProgressIssues",   issueRepository.countByStatusAndAssignee(Issue.Status.IN_PROGRESS, currentUser));
            stats.put("resolvedIssues",     issueRepository.countByStatusAndAssignee(Issue.Status.RESOLVED, currentUser));
            stats.put("closedIssues",       issueRepository.countByStatusAndAssignee(Issue.Status.CLOSED, currentUser));
            stats.put("highPriorityIssues", 0);
            stats.put("criticalIssues",     0);
        } else {
            stats.put("totalIssues",        issueRepository.countByReporter(currentUser));
            stats.put("openIssues",         issueRepository.countByStatusAndReporter(Issue.Status.OPEN, currentUser));
            stats.put("inProgressIssues",   issueRepository.countByStatusAndReporter(Issue.Status.IN_PROGRESS, currentUser));
            stats.put("resolvedIssues",     issueRepository.countByStatusAndReporter(Issue.Status.RESOLVED, currentUser));
            stats.put("closedIssues",       issueRepository.countByStatusAndReporter(Issue.Status.CLOSED, currentUser));
            stats.put("highPriorityIssues", 0);
            stats.put("criticalIssues",     0);
        }

        // Issues by priority breakdown
        List<Map<String, Object>> issuesByPriority = Arrays.stream(Issue.Priority.values())
                .map(p -> {
                    long count = issueRepository.countByPriority(p);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("_id",   p.name().toLowerCase());
                    m.put("count", count);
                    return m;
                })
                .filter(m -> (long) m.get("count") > 0)
                .collect(Collectors.toList());

        // Issues by type breakdown
        List<Map<String, Object>> issuesByType = Arrays.stream(Issue.Type.values())
                .map(t -> {
                    long count = issueRepository.findAll().stream()
                            .filter(i -> i.getType() == t).count();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("_id",   t.name().toLowerCase());
                    m.put("count", count);
                    return m;
                })
                .filter(m -> (long) m.get("count") > 0)
                .collect(Collectors.toList());

        // 5 most recent issues
        List<IssueSummaryDTO> recentIssues = issueRepository
                .findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .stream()
                .map(mapper::toIssueSummaryDTO)
                .collect(Collectors.toList());

        // Top assignees (admin only)
        List<Map<String, Object>> topAssignees = new ArrayList<>();
        if (isAdmin) {
            Map<Long, Long> assigneeCounts = issueRepository.findAll().stream()
                    .filter(i -> i.getAssignee() != null)
                    .collect(Collectors.groupingBy(
                            i -> i.getAssignee().getId(), Collectors.counting()
                    ));

            topAssignees = assigneeCounts.entrySet().stream()
                    .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                    .limit(5)
                    .map(e -> {
                        Map<String, Object> m = new LinkedHashMap<>();
                        userRepository.findById(e.getKey()).ifPresent(u -> {
                            m.put("user",       mapper.toUserDTO(u));
                            m.put("issueCount", e.getValue());
                        });
                        return m;
                    })
                    .filter(m -> !m.isEmpty())
                    .collect(Collectors.toList());
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success",        true);
        result.put("stats",          stats);
        result.put("issuesByPriority", issuesByPriority);
        result.put("issuesByType",   issuesByType);
        result.put("issuesTrend",    List.of());
        result.put("recentIssues",   recentIssues);
        result.put("topAssignees",   topAssignees);
        return result;
    }
}
