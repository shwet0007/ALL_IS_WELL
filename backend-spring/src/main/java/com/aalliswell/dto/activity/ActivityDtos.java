package com.aalliswell.dto.activity;

import com.aalliswell.entity.Achievement;
import com.aalliswell.entity.CalendarItem;
import com.aalliswell.entity.Checkup;
import com.aalliswell.entity.CryLog;
import com.aalliswell.entity.DailyCheckup;
import com.aalliswell.entity.DailyTask;
import com.aalliswell.entity.DietPlanProgress;
import com.aalliswell.entity.DiaryEntry;
import com.aalliswell.entity.DoctorNote;
import com.aalliswell.entity.DoctorRequest;
import com.aalliswell.entity.FoodIntroEntry;
import com.aalliswell.entity.MedicalReport;
import com.aalliswell.entity.MonthlyReport;
import com.aalliswell.entity.Notification;
import com.aalliswell.entity.Product;
import com.aalliswell.entity.Reminder;
import com.aalliswell.entity.Schedule;
import com.aalliswell.entity.User;
import com.aalliswell.entity.BabyDietPlan;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

public final class ActivityDtos {

    private ActivityDtos() {
    }

    public static String lower(Enum<?> value) {
        return value == null ? null : value.name().toLowerCase();
    }

    @Getter
    @Setter
    public static class ScheduleRequest {
        @NotBlank
        private String title;
        @NotBlank
        private String time;
        @NotBlank
        private String type;
        private Boolean completed;
        private String date;
        private String note;
        private String babyMessage;
    }

    @Getter
    @Setter
    public static class ScheduleResponse {
        private Long id;
        private String title;
        private String time;
        private String type;
        private boolean completed;
        private String date;
        private String note;
        private String babyMessage;

        public static ScheduleResponse from(Schedule schedule) {
            ScheduleResponse dto = new ScheduleResponse();
            dto.id = schedule.getId();
            dto.title = schedule.getTitle();
            dto.time = schedule.getTime();
            dto.type = lower(schedule.getType());
            dto.completed = schedule.isCompleted();
            dto.date = schedule.getDate();
            dto.note = schedule.getNote();
            dto.babyMessage = schedule.getBabyMessage();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class ReminderResponse {
        private Long id;
        private String userId;
        private String sourceType;
        private String sourceId;
        private String title;
        private String time;
        private String date;
        private String babyMessage;
        private boolean sent;

        public static ReminderResponse from(Reminder reminder) {
            ReminderResponse dto = new ReminderResponse();
            dto.id = reminder.getId();
            dto.userId = String.valueOf(reminder.getUser().getId());
            dto.sourceType = lower(reminder.getSourceType());
            dto.sourceId = reminder.getSourceId();
            dto.title = reminder.getTitle();
            dto.time = reminder.getTime();
            dto.date = reminder.getDate();
            dto.babyMessage = reminder.getBabyMessage();
            dto.sent = reminder.isSent();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class ReminderPatchRequest {
        private Boolean sent;
    }

    @Getter
    @Setter
    public static class NotificationResponse {
        private Long id;
        private String userId;
        private String title;
        private String message;
        private String sourceType;
        private String sourceId;
        @JsonProperty("isRead")
        private boolean read;
        private Instant createdAt;

        public static NotificationResponse from(Notification notification) {
            NotificationResponse dto = new NotificationResponse();
            dto.id = notification.getId();
            dto.userId = String.valueOf(notification.getUser().getId());
            dto.title = notification.getTitle();
            dto.message = notification.getMessage();
            dto.sourceType = lower(notification.getSourceType());
            dto.sourceId = notification.getSourceId();
            dto.read = notification.isRead();
            dto.createdAt = notification.getCreatedAt();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class DiaryEntryRequest {
        @NotBlank
        private String date;
        @NotBlank
        private String mood;
        private String text;
        private List<String> imageUrls;
        private List<String> medicalConditions;
        @JsonProperty("isMilestone")
        private Boolean milestone;
        private String milestoneTitle;
        private String milestoneCategory;
        private String milestoneDescription;
    }

    @Getter
    @Setter
    public static class DiaryEntryResponse {
        private Long id;
        private String date;
        private String mood;
        private String text;
        private List<String> imageUrls;
        private List<String> medicalConditions;
        @JsonProperty("isMilestone")
        private boolean milestone;
        private String milestoneTitle;
        private String milestoneCategory;
        private String milestoneDescription;

        public static DiaryEntryResponse from(DiaryEntry entry) {
            DiaryEntryResponse dto = new DiaryEntryResponse();
            dto.id = entry.getId();
            dto.date = entry.getDate();
            dto.mood = entry.getMood();
            dto.text = entry.getText();
            dto.imageUrls = entry.getImageUrls();
            dto.medicalConditions = entry.getMedicalConditions();
            dto.milestone = entry.isMilestone();
            dto.milestoneTitle = entry.getMilestoneTitle();
            dto.milestoneCategory = entry.getMilestoneCategory();
            dto.milestoneDescription = entry.getMilestoneDescription();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class DailyTaskPatchRequest {
        private String status;
        private String note;
    }

    @Getter
    @Setter
    public static class DailyTaskResponse {
        private Long id;
        private String date;
        private String task;
        private String status;
        private String note;

        public static DailyTaskResponse from(DailyTask task) {
            DailyTaskResponse dto = new DailyTaskResponse();
            dto.id = task.getId();
            dto.date = task.getDate();
            dto.task = task.getTask();
            dto.status = lower(task.getStatus());
            dto.note = task.getNote();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class DailyCheckupRequest {
        private DailyCheckupResponses responses;
    }

    public record DailyCheckupResponses(String physical, String mental, String lifestyle, String babyRelated) {
    }

    @Getter
    @Setter
    public static class DailyCheckupResponse {
        private Long id;
        private String role;
        private String date;
        private DailyCheckupResponses responses;

        public static DailyCheckupResponse from(DailyCheckup checkup) {
            DailyCheckupResponse dto = new DailyCheckupResponse();
            dto.id = checkup.getId();
            dto.role = lower(checkup.getRole());
            dto.date = checkup.getDate();
            dto.responses = new DailyCheckupResponses(
                    checkup.getPhysicalResponse(),
                    checkup.getMentalResponse(),
                    checkup.getLifestyleResponse(),
                    checkup.getBabyRelatedResponse()
            );
            return dto;
        }
    }

    @Getter
    @Setter
    public static class CheckupRequest {
        @NotBlank
        private String date;
        @NotBlank
        private String type;
        private String note;
        private Boolean isUrgent;
        private String patientId;
    }

    @Getter
    @Setter
    public static class CheckupResponse {
        private Long id;
        private String date;
        private String type;
        private String note;
        private String status;
        private boolean isUrgent;
        private String scheduledBy;
        private String patientId;
        private String patientName;

        public static CheckupResponse from(Checkup checkup) {
            CheckupResponse dto = new CheckupResponse();
            dto.id = checkup.getId();
            dto.date = checkup.getDate();
            dto.type = lower(checkup.getType());
            dto.note = checkup.getNote();
            dto.status = lower(checkup.getStatus());
            dto.isUrgent = checkup.isUrgent();
            dto.scheduledBy = String.valueOf(checkup.getScheduledBy().getId());
            dto.patientId = String.valueOf(checkup.getPatient().getId());
            dto.patientName = checkup.getPatientName();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class CheckupStatusPatchRequest {
        @NotBlank
        private String status;
    }

    @Getter
    @Setter
    public static class MedicalReportRequest {
        @NotBlank
        private String date;
        @NotBlank
        private String fileName;
        @NotBlank
        private String fileUrl;
        @NotBlank
        private String doctorName;
        private String remarks;
        private String patientId;
    }

    @Getter
    @Setter
    public static class MedicalReportResponse {
        private Long id;
        private String date;
        private String fileName;
        private String fileUrl;
        private String doctorName;
        private String remarks;
        private String patientId;

        public static MedicalReportResponse from(MedicalReport report) {
            MedicalReportResponse dto = new MedicalReportResponse();
            dto.id = report.getId();
            dto.date = report.getDate();
            dto.fileName = report.getFileName();
            dto.fileUrl = report.getFileUrl();
            dto.doctorName = report.getDoctorName();
            dto.remarks = report.getRemarks();
            dto.patientId = String.valueOf(report.getPatient().getId());
            return dto;
        }
    }

    @Getter
    @Setter
    public static class DoctorNoteResponse {
        private Long id;
        private String date;
        private String content;
        private String doctorName;
        private String patientId;
        private String priority;

        public static DoctorNoteResponse from(DoctorNote note) {
            DoctorNoteResponse dto = new DoctorNoteResponse();
            dto.id = note.getId();
            dto.date = note.getDate();
            dto.content = note.getContent();
            dto.doctorName = note.getDoctorName();
            dto.patientId = String.valueOf(note.getPatient().getId());
            dto.priority = note.getPriority();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class DoctorRequestCreateRequest {
        @NotBlank
        private String doctorId;
    }

    @Getter
    @Setter
    public static class DoctorRequestPatchRequest {
        @NotBlank
        private String status;
    }

    @Getter
    @Setter
    public static class DoctorRequestResponse {
        private Long id;
        private String patientId;
        private String patientName;
        private String doctorId;
        private String doctorName;
        private String status;
        private Instant requestDate;
        private Instant responseDate;

        public static DoctorRequestResponse from(DoctorRequest request) {
            DoctorRequestResponse dto = new DoctorRequestResponse();
            dto.id = request.getId();
            dto.patientId = String.valueOf(request.getPatient().getId());
            dto.patientName = request.getPatientName();
            dto.doctorId = String.valueOf(request.getDoctor().getId());
            dto.doctorName = request.getDoctorName();
            dto.status = lower(request.getStatus());
            dto.requestDate = request.getRequestDate();
            dto.responseDate = request.getResponseDate();
            return dto;
        }
    }

    public record DoctorRoomResponse(String roomCode, String doctorId, String doctorName) {
        public static DoctorRoomResponse from(User doctor) {
            return new DoctorRoomResponse(
                    doctor.getDoctorRoomId(),
                    String.valueOf(doctor.getId()),
                    doctor.getName()
            );
        }
    }

    @Getter
    @Setter
    public static class CalendarItemRequest {
        @NotBlank
        private String date;
        @NotBlank
        private String category;
        @NotBlank
        private String title;
        private String description;
    }

    @Getter
    @Setter
    public static class CalendarItemResponse {
        private Long id;
        private String date;
        private String category;
        private String title;
        private String description;

        public static CalendarItemResponse from(CalendarItem item) {
            CalendarItemResponse dto = new CalendarItemResponse();
            dto.id = item.getId();
            dto.date = item.getDate();
            dto.category = item.getCategory();
            dto.title = item.getTitle();
            dto.description = item.getDescription();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class ProductRequest {
        @NotBlank
        private String name;
        @NotBlank
        private String description;
        @NotBlank
        private String imageUrl;
        @NotBlank
        private String category;
        private String price;
        private Boolean isSponsored;
        private String companyName;
        private String externalLink;
    }

    @Getter
    @Setter
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private String imageUrl;
        private String category;
        private String price;
        @JsonProperty("isSponsored")
        private boolean sponsored;
        private String companyName;
        private String externalLink;

        public static ProductResponse from(Product product) {
            ProductResponse dto = new ProductResponse();
            dto.id = product.getId();
            dto.name = product.getName();
            dto.description = product.getDescription();
            dto.imageUrl = product.getImageUrl();
            dto.category = lower(product.getCategory());
            dto.price = product.getPrice();
            dto.sponsored = product.isSponsored();
            dto.companyName = product.getCompanyName();
            dto.externalLink = product.getExternalLink();
            return dto;
        }
    }

    @Getter
    @Setter
    public static class DietPlanProgressRequest {
        @NotBlank
        private String date;

        @NotNull
        private List<Map<String, Object>> sections;
    }

    public record DietPlanProgressResponse(String date, List<Map<String, Object>> sections) {
        public static DietPlanProgressResponse from(DietPlanProgress progress, List<Map<String, Object>> sections) {
            return new DietPlanProgressResponse(progress.getDate(), sections);
        }
    }

    @Getter
    @Setter
    public static class FoodIntroEntryRequest {
        @NotBlank
        private String foodName;

        @NotBlank
        private String introductionDate;

        @NotBlank
        private String reaction;

        private String notes;
    }

    public record FoodIntroEntryResponse(
            Long id,
            String foodName,
            String introductionDate,
            String reaction,
            String notes
    ) {
        public static FoodIntroEntryResponse from(FoodIntroEntry entry) {
            return new FoodIntroEntryResponse(
                    entry.getId(),
                    entry.getFoodName(),
                    entry.getIntroductionDate(),
                    entry.getReaction(),
                    entry.getNotes()
            );
        }
    }

    @Getter
    @Setter
    public static class BabyDietPlanRequest {
        @NotBlank
        private String plan;

        @NotNull
        @Min(0)
        private Integer babyAgeWeeks;

        private Instant generatedAt;
    }

    public record BabyDietPlanResponse(Long id, String plan, Instant generatedAt, Integer babyAgeWeeks) {
        public static BabyDietPlanResponse from(BabyDietPlan plan) {
            return new BabyDietPlanResponse(
                    plan.getId(),
                    plan.getPlan(),
                    plan.getGeneratedAt(),
                    plan.getBabyAgeWeeks()
            );
        }
    }

    public record EmergencyCallRequest(String to, String name, String location) {
    }

    public record EmergencyCallResponse(boolean success, String message, String callSid) {
    }

    public record CryAnalysisResponse(String pattern, Double confidence, String message) {
    }

    public record AchievementResponse(Long id, String type, int level, Instant dateEarned, String description, String icon) {
        public static AchievementResponse from(Achievement achievement) {
            return new AchievementResponse(
                    achievement.getId(),
                    achievement.getType(),
                    achievement.getLevel(),
                    achievement.getDateEarned(),
                    achievement.getDescription(),
                    achievement.getIcon()
            );
        }
    }

    public record MonthlyReportResponse(
            Long id,
            String month,
            int consistencyScore,
            Metrics metrics,
            List<String> highlights,
            List<String> attentionAreas
    ) {
        public static MonthlyReportResponse from(MonthlyReport report) {
            return new MonthlyReportResponse(
                    report.getId(),
                    report.getMonth(),
                    report.getConsistencyScore(),
                    new Metrics(
                            report.getCheckupCompletion(),
                            report.getRoutineAdherence(),
                            report.getVaccinationTimeliness(),
                            report.getSleepRegularity()
                    ),
                    report.getHighlights(),
                    report.getAttentionAreas()
            );
        }
    }

    public record Metrics(
            int checkupCompletion,
            int routineAdherence,
            int vaccinationTimeliness,
            int sleepRegularity
    ) {
    }
}
