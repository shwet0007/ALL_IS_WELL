package com.aalliswell.repository;

import com.aalliswell.entity.DailyTask;
import com.aalliswell.enums.DailyTaskStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyTaskRepository extends JpaRepository<DailyTask, Long> {

    Optional<DailyTask> findByUser_IdAndDate(Long userId, String date);

    List<DailyTask> findTop30ByUser_IdOrderByDateDesc(Long userId);

    long countByUser_IdAndStatus(Long userId, DailyTaskStatus status);

    List<DailyTask> findByUser_IdAndDateGreaterThanEqual(Long userId, String date);

    Optional<DailyTask> findByIdAndUser_Id(Long id, Long userId);
}
