package com.aalliswell.repository;

import com.aalliswell.entity.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByUser_IdOrderByCreatedAtDesc(Long userId);

    long countByUser_IdAndReadFalse(Long userId);

    Optional<Notification> findByIdAndUser_Id(Long id, Long userId);

    List<Notification> findByUser_IdAndReadFalse(Long userId);
}
