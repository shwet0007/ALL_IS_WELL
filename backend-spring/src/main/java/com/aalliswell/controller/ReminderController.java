package com.aalliswell.controller;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.security.SecurityUtils;
import com.aalliswell.service.CareService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final CareService careService;

    public ReminderController(CareService careService) {
        this.careService = careService;
    }

    @GetMapping("/active")
    public Map<String, Object> activeReminders() {
        return Map.of("reminders", careService.activeReminders(SecurityUtils.currentUserId()));
    }

    @PatchMapping("/{id}")
    public Map<String, Object> updateReminder(
            @PathVariable Long id,
            @RequestBody ActivityDtos.ReminderPatchRequest request
    ) {
        return Map.of("success", true, "reminder", careService.updateReminder(SecurityUtils.currentUserId(), id, request));
    }
}
