package com.issuetracker.repository;

import com.issuetracker.entity.Issue;
import com.issuetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    @Query("SELECT MAX(i.issueNumber) FROM Issue i")
    Optional<Long> findMaxIssueNumber();

    long countByStatus(Issue.Status status);
    long countByPriority(Issue.Priority priority);
    long countByReporter(User reporter);
    long countByAssignee(User assignee);
    long countByStatusAndReporter(Issue.Status status, User reporter);
    long countByStatusAndAssignee(Issue.Status status, User assignee);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.reporter = :user OR i.assignee = :user")
    long countByReporterOrAssignee(@Param("user") User user);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.status = :status AND (i.reporter = :user OR i.assignee = :user)")
    long countByStatusAndReporterOrAssignee(@Param("status") Issue.Status status, @Param("user") User user);
}
