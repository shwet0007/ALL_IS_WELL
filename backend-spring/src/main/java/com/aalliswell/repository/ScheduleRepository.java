package com.aalliswell.repository;

import com.aalliswell.entity.Schedule;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByUser_IdOrderByTimeAsc(Long userId);

    Optional<Schedule> findByIdAndUser_Id(Long id, Long userId);

    long countByUser_Id(Long userId);

    long countByUser_IdAndCompletedTrue(Long userId);
}
