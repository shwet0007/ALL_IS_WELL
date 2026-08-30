package com.aalliswell.repository;

import com.aalliswell.entity.CryLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CryLogRepository extends JpaRepository<CryLog, Long> {

    long countByUser_Id(Long userId);
}
