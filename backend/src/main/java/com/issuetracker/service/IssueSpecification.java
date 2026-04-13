package com.issuetracker.service;

import com.issuetracker.entity.Issue;
import com.issuetracker.entity.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class IssueSpecification {

    public static Specification<Issue> filter(
            String search,
            Issue.Status status,
            Issue.Priority priority,
            Issue.Type type,
            User currentUser
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Role-based visibility
            if (currentUser.getRole() == User.Role.REPORTER) {
                predicates.add(cb.equal(root.get("reporter"), currentUser));
            } else if (currentUser.getRole() == User.Role.DEVELOPER) {
                predicates.add(cb.or(
                        cb.equal(root.get("reporter"), currentUser),
                        cb.equal(root.get("assignee"), currentUser)
                ));
            }
            // ADMIN sees all

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (priority != null) predicates.add(cb.equal(root.get("priority"), priority));
            if (type != null) predicates.add(cb.equal(root.get("type"), type));

            // Avoid duplicate rows from joins
            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
