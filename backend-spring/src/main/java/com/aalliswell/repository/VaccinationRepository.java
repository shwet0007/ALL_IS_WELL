package com.aalliswell.repository;

import com.aalliswell.entity.Vaccination;
import com.aalliswell.enums.VaccinationStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {

    List<Vaccination> findByUser_IdOrderByDueDateAsc(Long userId);

    List<Vaccination> findByUser_IdAndStatusAndDueDateAfterOrderByDueDateAsc(
            Long userId,
            VaccinationStatus status,
            LocalDate dueDate
    );

    long countByUser_Id(Long userId);

    long countByUser_IdAndStatus(Long userId, VaccinationStatus status);
}
