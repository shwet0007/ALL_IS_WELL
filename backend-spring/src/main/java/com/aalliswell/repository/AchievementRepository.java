package com.aalliswell.repository;

import com.aalliswell.entity.Achievement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findByUser_Id(Long userId);
}
