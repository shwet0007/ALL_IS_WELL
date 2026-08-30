package com.aalliswell.repository;

import com.aalliswell.entity.CalendarItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarItemRepository extends JpaRepository<CalendarItem, Long> {

    List<CalendarItem> findByUser_IdOrderByDateAsc(Long userId);

    Optional<CalendarItem> findByIdAndUser_Id(Long id, Long userId);
}
