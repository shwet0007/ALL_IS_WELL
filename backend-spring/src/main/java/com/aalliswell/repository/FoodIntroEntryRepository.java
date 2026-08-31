package com.aalliswell.repository;

import com.aalliswell.entity.FoodIntroEntry;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodIntroEntryRepository extends JpaRepository<FoodIntroEntry, Long> {

    List<FoodIntroEntry> findByUser_IdOrderByIntroductionDateDescCreatedAtDesc(Long userId);

    Optional<FoodIntroEntry> findByIdAndUser_Id(Long id, Long userId);
}
