package com.aalliswell.repository;

import com.aalliswell.entity.MonthlyReport;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Long> {

    Optional<MonthlyReport> findByUser_IdAndMonth(Long userId, String month);
}
