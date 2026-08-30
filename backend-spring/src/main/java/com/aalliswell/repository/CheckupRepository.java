package com.aalliswell.repository;

import com.aalliswell.entity.Checkup;
import com.aalliswell.enums.CheckupStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckupRepository extends JpaRepository<Checkup, Long> {

    List<Checkup> findByPatient_IdOrScheduledBy_IdOrderByDateDesc(Long patientId, Long scheduledById);

    List<Checkup> findByPatient_IdOrderByDateDesc(Long patientId);

    long countByPatient_IdAndStatus(Long patientId, CheckupStatus status);
}
