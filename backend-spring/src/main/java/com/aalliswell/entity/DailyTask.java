package com.aalliswell.entity;

import com.aalliswell.enums.DailyTaskStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "daily_tasks",
        uniqueConstraints = @UniqueConstraint(name = "uk_daily_task_user_date", columnNames = {"user_id", "date"}),
        indexes = @Index(name = "idx_daily_tasks_user_date", columnList = "user_id,date")
)
public class DailyTask extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String task;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DailyTaskStatus status = DailyTaskStatus.PENDING;

    private String note;
}
