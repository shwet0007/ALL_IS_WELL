package com.aalliswell.controller;

import com.aalliswell.dto.common.SuccessResponse;
import com.aalliswell.security.SecurityUtils;
import com.aalliswell.service.NotificationService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public Map<String, Object> notifications() {
        return Map.of("notifications", notificationService.notifications(SecurityUtils.currentUserId()));
    }

    @GetMapping("/unread-count")
    public Map<String, Object> unreadCount() {
        return Map.of("count", notificationService.unreadCount(SecurityUtils.currentUserId()));
    }

    @PatchMapping("/{id}/read")
    public Map<String, Object> markRead(@PathVariable Long id) {
        return Map.of("success", true, "notification", notificationService.markRead(SecurityUtils.currentUserId(), id));
    }

    @PatchMapping("/read-all")
    public SuccessResponse markAllRead() {
        notificationService.markAllRead(SecurityUtils.currentUserId());
        return new SuccessResponse(true, "Notifications marked as read");
    }
}
