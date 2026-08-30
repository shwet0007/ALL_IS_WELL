package com.aalliswell.entity;

import com.aalliswell.enums.CheckupStatus;
import com.aalliswell.enums.CheckupType;
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "checkups", indexes = {
        @Index(name = "idx_checkups_patient", columnList = "patient_id"),
        @Index(name = "idx_checkups_scheduled_by", columnList = "scheduled_by_id")
})
public class Checkup extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheduled_by_id", nullable = false)
    private User scheduledBy;

    @Column(nullable = false)
    private String date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckupType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckupStatus status = CheckupStatus.SCHEDULED;

    private boolean urgent;
    private String patientName;

    @Column(columnDefinition = "TEXT")
    private String note;
}
