package com.aalliswell.repository;

import com.aalliswell.entity.EmergencyLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyLogRepository extends JpaRepository<EmergencyLog, Long> {

    List<EmergencyLog> findTop30ByUser_IdOrderByTimestampDesc(Long userId);

    long countByUser_Id(Long userId);
}
