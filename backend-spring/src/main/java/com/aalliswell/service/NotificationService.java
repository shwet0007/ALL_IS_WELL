package com.aalliswell.service;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.entity.Notification;
import com.aalliswell.entity.User;
import com.aalliswell.enums.NotificationSourceType;
import com.aalliswell.exception.ResourceNotFoundException;
import com.aalliswell.repository.NotificationRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final UserService userService;
    private final NotificationRepository notificationRepository;
    private final FcmNotificationService fcmNotificationService;

    public NotificationService(
            UserService userService,
            NotificationRepository notificationRepository,
            FcmNotificationService fcmNotificationService
    ) {
        this.userService = userService;
        this.notificationRepository = notificationRepository;
        this.fcmNotificationService = fcmNotificationService;
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.NotificationResponse> notifications(Long userId) {
        return notificationRepository.findTop50ByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(ActivityDtos.NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUser_IdAndReadFalse(userId);
    }

    @Transactional
    public ActivityDtos.NotificationResponse markRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUser_Id(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return ActivityDtos.NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.findByUser_IdAndReadFalse(userId).forEach(notification -> notification.setRead(true));
    }

    @Transactional
    public Notification notifyUser(
            User user,
            String title,
            String message,
            NotificationSourceType sourceType,
            String sourceId
    ) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setSourceType(sourceType);
        notification.setSourceId(sourceId);
        Notification saved = notificationRepository.save(notification);
        Map<String, String> data = new HashMap<>();
        data.put("sourceType", sourceType.name().toLowerCase());
        data.put("sourceId", sourceId == null ? "" : sourceId);
        fcmNotificationService.send(user, title, message, data);
        return saved;
    }

    @Transactional
    public Notification notifyUser(
            Long userId,
            String title,
            String message,
            NotificationSourceType sourceType,
            String sourceId
    ) {
        return notifyUser(userService.findById(userId), title, message, sourceType, sourceId);
    }
}
