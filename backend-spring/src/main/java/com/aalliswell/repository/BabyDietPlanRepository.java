package com.aalliswell.repository;

import com.aalliswell.entity.BabyDietPlan;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BabyDietPlanRepository extends JpaRepository<BabyDietPlan, Long> {

    Optional<BabyDietPlan> findByUser_Id(Long userId);
}
