package com.aalliswell.repository;

import com.aalliswell.entity.DiaryEntry;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {

    List<DiaryEntry> findByUser_IdOrderByDateDesc(Long userId);

    List<DiaryEntry> findTop30ByUser_IdOrderByDateDesc(Long userId);

    Optional<DiaryEntry> findByUser_IdAndDate(Long userId, String date);

    void deleteByUser_IdAndDate(Long userId, String date);
}
