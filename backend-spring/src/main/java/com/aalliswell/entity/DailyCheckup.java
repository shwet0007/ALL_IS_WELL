package com.aalliswell.entity;

import com.aalliswell.enums.Role;
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
        name = "daily_checkups",
        uniqueConstraints = @UniqueConstraint(name = "uk_daily_checkup_user_date", columnNames = {"user_id", "date"}),
        indexes = @Index(name = "idx_daily_checkups_user_date", columnList = "user_id,date")
)
public class DailyCheckup extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String physicalResponse;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mentalResponse;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String lifestyleResponse;

    @Column(columnDefinition = "TEXT")
    private String babyRelatedResponse;
}
