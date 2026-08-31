package com.aalliswell.repository;

import com.aalliswell.entity.DietPlanProgress;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DietPlanProgressRepository extends JpaRepository<DietPlanProgress, Long> {

    Optional<DietPlanProgress> findByUser_IdAndDate(Long userId, String date);

    Optional<DietPlanProgress> findTopByUser_IdOrderByDateDesc(Long userId);
}
