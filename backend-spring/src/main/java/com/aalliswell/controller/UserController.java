package com.aalliswell.controller;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.dto.common.SuccessResponse;
import com.aalliswell.dto.user.ProfileUpdateRequest;
import com.aalliswell.security.SecurityUtils;
import com.aalliswell.service.AnalyticsService;
import com.aalliswell.service.CareService;
import com.aalliswell.service.EnumParser;
import com.aalliswell.service.UserService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final CareService careService;
    private final AnalyticsService analyticsService;

    public UserController(UserService userService, CareService careService, AnalyticsService analyticsService) {
        this.userService = userService;
        this.careService = careService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/profile")
    public Map<String, Object> profile() {
        return Map.of("profile", userService.getProfile(SecurityUtils.currentUserId()));
    }

    @GetMapping("/profile/{id}")
    public Map<String, Object> publicProfile(@PathVariable String id) {
        return Map.of("profile", userService.getPublicProfile(EnumParser.parseId(id, "id")));
    }

    @PutMapping("/profile")
    public Map<String, Object> updateProfile(@RequestBody ProfileUpdateRequest request) {
        return Map.of(
                "success", true,
                "profile", userService.updateProfile(SecurityUtils.currentUserId(), request),
                "message", "Profile updated successfully"
        );
    }

    @PutMapping("/fcm-token")
    public SuccessResponse updateFcmToken(@RequestBody Map<String, String> request) {
        userService.updateFcmToken(SecurityUtils.currentUserId(), request.get("fcmToken"), request.get("timezone"));
        return new SuccessResponse(true, "FCM token updated");
    }

    @GetMapping("/diary")
    public Map<String, Object> diaryEntries() {
        return Map.of("entries", careService.diaryEntries(SecurityUtils.currentUserId()));
    }

    @PostMapping("/diary")
    public Map<String, Object> upsertDiaryEntry(@Valid @RequestBody ActivityDtos.DiaryEntryRequest request) {
        ActivityDtos.DiaryEntryResponse entry = careService.upsertDiaryEntry(SecurityUtils.currentUserId(), request);
        return Map.of("success", true, "id", entry.getId(), "entry", entry);
    }

    @DeleteMapping("/diary/{date}")
    public SuccessResponse deleteDiaryEntry(@PathVariable String date) {
        careService.deleteDiaryEntry(SecurityUtils.currentUserId(), date);
        return new SuccessResponse(true, "Diary entry deleted");
    }

    @GetMapping("/schedule")
    public Map<String, Object> schedules() {
        return Map.of("items", careService.schedules(SecurityUtils.currentUserId()));
    }

    @PostMapping("/schedule")
    public Map<String, Object> createSchedule(@Valid @RequestBody ActivityDtos.ScheduleRequest request) {
        return Map.of("success", true, "item", careService.createSchedule(SecurityUtils.currentUserId(), request));
    }

    @PatchMapping("/schedule/{id}")
    public Map<String, Object> updateSchedule(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return Map.of("success", true, "item", careService.updateSchedule(SecurityUtils.currentUserId(), id, updates));
    }

    @DeleteMapping("/schedule/{id}")
    public SuccessResponse deleteSchedule(@PathVariable Long id) {
        careService.deleteSchedule(SecurityUtils.currentUserId(), id);
        return new SuccessResponse(true, "Schedule item deleted");
    }

    @GetMapping("/checkups")
    public Map<String, Object> checkups() {
        return Map.of("checkups", careService.checkups(SecurityUtils.currentUserId()));
    }

    @PostMapping("/checkups")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, Object> scheduleCheckup(@Valid @RequestBody ActivityDtos.CheckupRequest request) {
        return Map.of("success", true, "checkup", careService.scheduleCheckup(SecurityUtils.currentUserId(), request));
    }

    @PostMapping("/checkups/request")
    @PreAuthorize("hasAnyRole('MOTHER','PREGNANT')")
    public Map<String, Object> requestAppointment(@Valid @RequestBody ActivityDtos.CheckupRequest request) {
        return Map.of("success", true, "checkup", careService.requestAppointment(SecurityUtils.currentUserId(), request));
    }

    @GetMapping("/reports")
    public Map<String, Object> reports() {
        return Map.of("reports", careService.reports(SecurityUtils.currentUserId()));
    }

    @PostMapping("/reports")
    public Map<String, Object> addReport(@Valid @RequestBody ActivityDtos.MedicalReportRequest request) {
        return Map.of("success", true, "report", careService.addReport(SecurityUtils.currentUserId(), request));
    }

    @DeleteMapping("/reports/{id}")
    public SuccessResponse deleteReport(@PathVariable Long id) {
        careService.deleteReport(SecurityUtils.currentUserId(), id);
        return new SuccessResponse(true, "Medical report deleted");
    }

    @GetMapping("/notes")
    public Map<String, Object> notes() {
        return Map.of("notes", careService.notes(SecurityUtils.currentUserId()));
    }

    @GetMapping("/calendar")
    public Map<String, Object> calendar() {
        return Map.of("items", careService.calendar(SecurityUtils.currentUserId()));
    }

    @PostMapping("/calendar")
    public Map<String, Object> createCalendarItem(@Valid @RequestBody ActivityDtos.CalendarItemRequest request) {
        return Map.of("success", true, "item", careService.createCalendarItem(SecurityUtils.currentUserId(), request));
    }

    @PutMapping("/calendar/{id}")
    public Map<String, Object> updateCalendarItem(@PathVariable Long id, @Valid @RequestBody ActivityDtos.CalendarItemRequest request) {
        return Map.of("success", true, "item", careService.updateCalendarItem(SecurityUtils.currentUserId(), id, request));
    }

    @DeleteMapping("/calendar/{id}")
    public SuccessResponse deleteCalendarItem(@PathVariable Long id) {
        careService.deleteCalendarItem(SecurityUtils.currentUserId(), id);
        return new SuccessResponse(true, "Calendar item deleted");
    }

    @GetMapping("/daily-task")
    public Map<String, Object> todayTask() {
        Long userId = SecurityUtils.currentUserId();
        return Map.of("task", careService.todayTask(userId), "streak", careService.completedTaskCount(userId));
    }

    @PatchMapping("/daily-task/{id}")
    public Map<String, Object> updateDailyTask(@PathVariable Long id, @RequestBody ActivityDtos.DailyTaskPatchRequest request) {
        return Map.of("success", true, "task", careService.updateDailyTask(SecurityUtils.currentUserId(), id, request));
    }

    @GetMapping("/daily-checkup/status")
    public Map<String, Object> dailyCheckupStatus() {
        return careService.dailyCheckupStatus(SecurityUtils.currentUserId());
    }

    @PostMapping("/daily-checkup")
    @PreAuthorize("hasAnyRole('MOTHER','PREGNANT')")
    public Map<String, Object> submitDailyCheckup(@RequestBody ActivityDtos.DailyCheckupRequest request) {
        return Map.of("success", true, "checkup", careService.submitDailyCheckup(SecurityUtils.currentUserId(), request));
    }

    @GetMapping("/analytics")
    public Map<String, Object> userAnalytics() {
        return analyticsService.overview(SecurityUtils.currentUserId());
    }

    @GetMapping("/doctors")
    public Map<String, Object> doctors() {
        return Map.of("doctors", userService.doctors());
    }

    @PostMapping("/doctor-request")
    @PreAuthorize("hasAnyRole('MOTHER','PREGNANT')")
    public Map<String, Object> sendDoctorRequest(@Valid @RequestBody ActivityDtos.DoctorRequestCreateRequest request) {
        return Map.of("success", true, "request", careService.sendDoctorRequest(SecurityUtils.currentUserId(), request));
    }

    @GetMapping("/doctor-requests")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, Object> pendingDoctorRequests() {
        return Map.of("requests", careService.pendingDoctorRequests(SecurityUtils.currentUserId()));
    }

    @PatchMapping("/doctor-request/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, Object> respondToDoctorRequest(
            @PathVariable Long id,
            @Valid @RequestBody ActivityDtos.DoctorRequestPatchRequest request
    ) {
        return Map.of("success", true, "request", careService.respondToDoctorRequest(SecurityUtils.currentUserId(), id, request));
    }
}
