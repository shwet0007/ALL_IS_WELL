package com.aalliswell.service;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.entity.MonthlyReport;
import com.aalliswell.enums.DailyTaskStatus;
import com.aalliswell.enums.VaccinationStatus;
import com.aalliswell.repository.AchievementRepository;
import com.aalliswell.repository.CheckupRepository;
import com.aalliswell.repository.DailyCheckupRepository;
import com.aalliswell.repository.DailyTaskRepository;
import com.aalliswell.repository.EmergencyLogRepository;
import com.aalliswell.repository.MonthlyReportRepository;
import com.aalliswell.repository.ScheduleRepository;
import com.aalliswell.repository.VaccinationRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {

    private final UserService userService;
    private final DailyTaskRepository dailyTaskRepository;
    private final DailyCheckupRepository dailyCheckupRepository;
    private final ScheduleRepository scheduleRepository;
    private final VaccinationRepository vaccinationRepository;
    private final EmergencyLogRepository emergencyLogRepository;
    private final MonthlyReportRepository monthlyReportRepository;
    private final AchievementRepository achievementRepository;
    private final CheckupRepository checkupRepository;

    public AnalyticsService(
            UserService userService,
            DailyTaskRepository dailyTaskRepository,
            DailyCheckupRepository dailyCheckupRepository,
            ScheduleRepository scheduleRepository,
            VaccinationRepository vaccinationRepository,
            EmergencyLogRepository emergencyLogRepository,
            MonthlyReportRepository monthlyReportRepository,
            AchievementRepository achievementRepository,
            CheckupRepository checkupRepository
    ) {
        this.userService = userService;
        this.dailyTaskRepository = dailyTaskRepository;
        this.dailyCheckupRepository = dailyCheckupRepository;
        this.scheduleRepository = scheduleRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.emergencyLogRepository = emergencyLogRepository;
        this.monthlyReportRepository = monthlyReportRepository;
        this.achievementRepository = achievementRepository;
        this.checkupRepository = checkupRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboardAdvanced(Long userId) {
        String last7Days = LocalDate.now().minusDays(7).toString();
        var tasks = dailyTaskRepository.findByUser_IdAndDateGreaterThanEqual(userId, last7Days);
        var checkups = dailyCheckupRepository.findByUser_IdAndDateGreaterThanEqual(userId, last7Days);

        double checkupComp = (checkups.size() / 7.0) * 100;
        double taskComp = tasks.isEmpty()
                ? 0
                : (tasks.stream().filter(t -> t.getStatus() == DailyTaskStatus.COMPLETED).count() / (double) tasks.size()) * 100;
        long schedules = scheduleRepository.countByUser_Id(userId);
        long completedSchedules = scheduleRepository.countByUser_IdAndCompletedTrue(userId);
        double scheduleComp = schedules == 0 ? 0 : (completedSchedules / (double) schedules) * 100;
        int consistencyScore = Math.min(100, (int) Math.round((checkupComp * 0.4) + (taskComp * 0.3) + (scheduleComp * 0.3)));

        List<Map<String, Object>> moodTrends = checkups.stream()
                .map(checkup -> Map.<String, Object>of(
                        "date", checkup.getDate(),
                        "score", moodScore(checkup.getMentalResponse()),
                        "label", checkup.getMentalResponse()
                ))
                .toList();

        return Map.of(
                "consistencyScore", consistencyScore,
                "consistencyLabel", consistencyScore > 80 ? "Excellent" : consistencyScore > 60 ? "Good" : "Needs Focus",
                "moodTrends", moodTrends,
                "kpis", Map.of(
                        "routine", Map.of(
                                "value", Math.round(scheduleComp),
                                "trend", "+5%",
                                "status", scheduleComp > 70 ? "Consistent" : "Needs attention"
                        ),
                        "completion", Map.of(
                                "value", Math.round(taskComp),
                                "trend", "Consistent"
                        )
                )
        );
    }

    @Transactional
    public ActivityDtos.MonthlyReportResponse monthlyReport(Long userId, String month) {
        MonthlyReport report = monthlyReportRepository.findByUser_IdAndMonth(userId, month)
                .orElseGet(() -> createMonthlyReport(userId, month));
        return ActivityDtos.MonthlyReportResponse.from(report);
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.AchievementResponse> achievements(Long userId) {
        return achievementRepository.findByUser_Id(userId).stream()
                .map(ActivityDtos.AchievementResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> overview(Long userId) {
        var userProfile = userService.getProfile(userId);
        long totalSchedules = scheduleRepository.countByUser_Id(userId);
        long completedSchedules = scheduleRepository.countByUser_IdAndCompletedTrue(userId);
        long totalVaccines = vaccinationRepository.countByUser_Id(userId);
        long completedVaccines = vaccinationRepository.countByUser_IdAndStatus(userId, VaccinationStatus.COMPLETED);
        long sosCount = emergencyLogRepository.countByUser_Id(userId);

        return Map.of(
                "overview", Map.of(
                        "taskStreak", dailyTaskRepository.countByUser_IdAndStatus(userId, DailyTaskStatus.COMPLETED),
                        "completionRate", percent(completedSchedules, totalSchedules),
                        "vaccinationProgress", percent(completedVaccines, totalVaccines),
                        "totalSOSTriggers", sosCount,
                        "routineAdherence", percent(completedSchedules, totalSchedules)
                ),
                "roleBasedMetrics", Map.of(
                        "type", userProfile.getRole(),
                        "highRisk", Boolean.TRUE.equals(userProfile.getHighRisk())
                ),
                "doctorInteraction", Map.of(
                        "connected", userProfile.getDoctorId() != null,
                        "checkupsScheduled", checkupRepository.findByPatient_IdOrderByDateDesc(userId).size()
                )
        );
    }

    private MonthlyReport createMonthlyReport(Long userId, String month) {
        MonthlyReport report = new MonthlyReport();
        report.setUser(userService.findById(userId));
        report.setMonth(month);
        report.setConsistencyScore(75);
        report.setCheckupCompletion(80);
        report.setRoutineAdherence(70);
        report.setVaccinationTimeliness(100);
        report.setSleepRegularity(65);
        report.setHighlights(List.of("Maintained consistent physical health check-ins", "Vaccination schedule on track"));
        report.setAttentionAreas(List.of("Late night routines need more consistency"));
        return monthlyReportRepository.save(report);
    }

    private int moodScore(String mood) {
        if (mood == null) {
            return 0;
        }
        return switch (mood.toLowerCase()) {
            case "happy" -> 4;
            case "calm" -> 3;
            case "anxious" -> 2;
            case "low" -> 1;
            default -> 0;
        };
    }

    private int percent(long numerator, long denominator) {
        return denominator == 0 ? 0 : (int) Math.round((numerator / (double) denominator) * 100);
    }
}
