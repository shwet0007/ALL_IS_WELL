package com.aalliswell.repository;

import com.aalliswell.entity.MedicalReport;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {

    List<MedicalReport> findByPatient_IdOrderByDateDesc(Long patientId);

    Optional<MedicalReport> findByIdAndPatient_Id(Long id, Long patientId);

    long countByPatient_Id(Long patientId);
}
