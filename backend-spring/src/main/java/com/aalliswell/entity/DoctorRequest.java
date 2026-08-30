package com.aalliswell.entity;

import com.aalliswell.enums.DoctorRequestStatus;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "doctor_requests", indexes = {
        @Index(name = "idx_doctor_requests_patient", columnList = "patient_id"),
        @Index(name = "idx_doctor_requests_doctor", columnList = "doctor_id")
})
public class DoctorRequest extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private String doctorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoctorRequestStatus status = DoctorRequestStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant requestDate;

    private Instant responseDate;

    @PrePersist
    void setRequestDate() {
        if (requestDate == null) {
            requestDate = Instant.now();
        }
    }
}
