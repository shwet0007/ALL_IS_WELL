package com.aalliswell.repository;

import com.aalliswell.entity.Checkup;
import com.aalliswell.enums.CheckupStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CheckupRepository extends JpaRepository<Checkup, Long> {

    List<Checkup> findByPatient_IdOrScheduledBy_IdOrderByDateDesc(Long patientId, Long scheduledById);

    List<Checkup> findByPatient_IdOrderByDateDesc(Long patientId);

    long countByPatient_IdAndStatus(Long patientId, CheckupStatus status);

    @Query("""
            select c from Checkup c
            where c.id = :id
              and (c.patient.id = :userId or c.scheduledBy.id = :userId)
            """)
    Optional<Checkup> findAccessibleById(@Param("id") Long id, @Param("userId") Long userId);
}
