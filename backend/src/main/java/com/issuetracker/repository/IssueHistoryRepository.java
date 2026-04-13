package com.issuetracker.repository;

import com.issuetracker.entity.IssueHistory;
import com.issuetracker.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueHistoryRepository extends JpaRepository<IssueHistory, Long> {
    List<IssueHistory> findByIssueOrderByChangedAtDesc(Issue issue);
}
