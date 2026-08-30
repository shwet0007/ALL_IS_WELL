package com.aalliswell.repository;

import com.aalliswell.entity.DoctorRequest;
import com.aalliswell.enums.DoctorRequestStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRequestRepository extends JpaRepository<DoctorRequest, Long> {

    boolean existsByPatient_IdAndDoctor_IdAndStatusIn(
            Long patientId,
            Long doctorId,
            Collection<DoctorRequestStatus> statuses
    );

    List<DoctorRequest> findByDoctor_IdAndStatusOrderByRequestDateDesc(Long doctorId, DoctorRequestStatus status);

    Optional<DoctorRequest> findByIdAndDoctor_Id(Long id, Long doctorId);
}
