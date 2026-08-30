package com.aalliswell.repository;

import com.aalliswell.entity.DailyCheckup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyCheckupRepository extends JpaRepository<DailyCheckup, Long> {

    Optional<DailyCheckup> findByUser_IdAndDate(Long userId, String date);

    List<DailyCheckup> findTop7ByUser_IdOrderByDateDesc(Long userId);

    List<DailyCheckup> findByUser_IdAndDateGreaterThanEqual(Long userId, String date);
}
