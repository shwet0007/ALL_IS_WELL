package com.aalliswell.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "monthly_reports",
        uniqueConstraints = @UniqueConstraint(name = "uk_monthly_report_user_month", columnNames = {"user_id", "report_month"}),
        indexes = @Index(name = "idx_monthly_reports_user_month", columnList = "user_id,report_month")
)
public class MonthlyReport extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "report_month", nullable = false)
    private String month;

    @Column(nullable = false)
    private int consistencyScore;

    private int checkupCompletion;
    private int routineAdherence;
    private int vaccinationTimeliness;
    private int sleepRegularity;

    @ElementCollection
    @CollectionTable(name = "monthly_report_highlights", joinColumns = @JoinColumn(name = "monthly_report_id"))
    @Column(name = "highlight")
    private List<String> highlights = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "monthly_report_attention_areas", joinColumns = @JoinColumn(name = "monthly_report_id"))
    @Column(name = "attention_area")
    private List<String> attentionAreas = new ArrayList<>();
}
