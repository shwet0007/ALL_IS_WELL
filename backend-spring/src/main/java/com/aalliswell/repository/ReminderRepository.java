package com.aalliswell.repository;

import com.aalliswell.entity.Reminder;
import com.aalliswell.enums.ReminderSourceType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUser_IdAndSentFalseAndDateInOrderByDateAscTimeAsc(Long userId, Collection<String> dates);

    Optional<Reminder> findByIdAndUser_Id(Long id, Long userId);

    Optional<Reminder> findByUser_IdAndSourceIdAndSourceTypeAndDate(
            Long userId,
            String sourceId,
            ReminderSourceType sourceType,
            String date
    );

    List<Reminder> findBySentFalse();

    void deleteBySourceIdAndSourceType(String sourceId, ReminderSourceType sourceType);
}
