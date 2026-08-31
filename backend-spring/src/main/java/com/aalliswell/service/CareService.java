package com.aalliswell.service;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.dto.user.UserProfileDto;
import com.aalliswell.entity.Baby;
import com.aalliswell.entity.BabyDietPlan;
import com.aalliswell.entity.CalendarItem;
import com.aalliswell.entity.Checkup;
import com.aalliswell.entity.DailyCheckup;
import com.aalliswell.entity.DailyTask;
import com.aalliswell.entity.DietPlanProgress;
import com.aalliswell.entity.DiaryEntry;
import com.aalliswell.entity.DoctorRequest;
import com.aalliswell.entity.FoodIntroEntry;
import com.aalliswell.entity.MedicalReport;
import com.aalliswell.entity.Reminder;
import com.aalliswell.entity.Schedule;
import com.aalliswell.entity.User;
import com.aalliswell.enums.CheckupStatus;
import com.aalliswell.enums.CheckupType;
import com.aalliswell.enums.DailyTaskStatus;
import com.aalliswell.enums.DoctorRequestStatus;
import com.aalliswell.enums.ReminderSourceType;
import com.aalliswell.enums.Role;
import com.aalliswell.enums.ScheduleType;
import com.aalliswell.exception.ForbiddenException;
import com.aalliswell.exception.ResourceNotFoundException;
import com.aalliswell.repository.CalendarItemRepository;
import com.aalliswell.repository.BabyDietPlanRepository;
import com.aalliswell.repository.CheckupRepository;
import com.aalliswell.repository.DailyCheckupRepository;
import com.aalliswell.repository.DailyTaskRepository;
import com.aalliswell.repository.DietPlanProgressRepository;
import com.aalliswell.repository.DiaryEntryRepository;
import com.aalliswell.repository.DoctorNoteRepository;
import com.aalliswell.repository.DoctorRequestRepository;
import com.aalliswell.repository.FoodIntroEntryRepository;
import com.aalliswell.repository.MedicalReportRepository;
import com.aalliswell.repository.ReminderRepository;
import com.aalliswell.repository.ScheduleRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CareService {

    private static final Set<String> VALID_FOOD_REACTIONS = Set.of("good", "bad", "gas", "constipation", "allergy", "rash");

    private final UserService userService;
    private final ScheduleRepository scheduleRepository;
    private final ReminderRepository reminderRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final DailyTaskRepository dailyTaskRepository;
    private final DailyCheckupRepository dailyCheckupRepository;
    private final CheckupRepository checkupRepository;
    private final MedicalReportRepository medicalReportRepository;
    private final DoctorNoteRepository doctorNoteRepository;
    private final DoctorRequestRepository doctorRequestRepository;
    private final CalendarItemRepository calendarItemRepository;
    private final DietPlanProgressRepository dietPlanProgressRepository;
    private final FoodIntroEntryRepository foodIntroEntryRepository;
    private final BabyDietPlanRepository babyDietPlanRepository;
    private final ObjectMapper objectMapper;
    private final GroqService groqService;

    public CareService(
            UserService userService,
            ScheduleRepository scheduleRepository,
            ReminderRepository reminderRepository,
            DiaryEntryRepository diaryEntryRepository,
            DailyTaskRepository dailyTaskRepository,
            DailyCheckupRepository dailyCheckupRepository,
            CheckupRepository checkupRepository,
            MedicalReportRepository medicalReportRepository,
            DoctorNoteRepository doctorNoteRepository,
            DoctorRequestRepository doctorRequestRepository,
            CalendarItemRepository calendarItemRepository,
            DietPlanProgressRepository dietPlanProgressRepository,
            FoodIntroEntryRepository foodIntroEntryRepository,
            BabyDietPlanRepository babyDietPlanRepository,
            ObjectMapper objectMapper,
            GroqService groqService
    ) {
        this.userService = userService;
        this.scheduleRepository = scheduleRepository;
        this.reminderRepository = reminderRepository;
        this.diaryEntryRepository = diaryEntryRepository;
        this.dailyTaskRepository = dailyTaskRepository;
        this.dailyCheckupRepository = dailyCheckupRepository;
        this.checkupRepository = checkupRepository;
        this.medicalReportRepository = medicalReportRepository;
        this.doctorNoteRepository = doctorNoteRepository;
        this.doctorRequestRepository = doctorRequestRepository;
        this.calendarItemRepository = calendarItemRepository;
        this.dietPlanProgressRepository = dietPlanProgressRepository;
        this.foodIntroEntryRepository = foodIntroEntryRepository;
        this.babyDietPlanRepository = babyDietPlanRepository;
        this.objectMapper = objectMapper;
        this.groqService = groqService;
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.ScheduleResponse> schedules(Long userId) {
        return scheduleRepository.findByUser_IdOrderByTimeAsc(userId).stream()
                .map(ActivityDtos.ScheduleResponse::from)
                .toList();
    }

    @Transactional
    public ActivityDtos.ScheduleResponse createSchedule(Long userId, ActivityDtos.ScheduleRequest request) {
        User user = userService.findById(userId);
        Schedule schedule = new Schedule();
        schedule.setUser(user);
        schedule.setTitle(request.getTitle());
        schedule.setTime(request.getTime());
        schedule.setType(EnumParser.parse(ScheduleType.class, request.getType(), ScheduleType.OTHER));
        schedule.setCompleted(Boolean.TRUE.equals(request.getCompleted()));
        schedule.setDate(request.getDate());
        schedule.setNote(request.getNote());
        schedule.setBabyMessage(request.getBabyMessage());
        Schedule saved = scheduleRepository.save(schedule);
        upsertReminderForSchedule(saved);
        return ActivityDtos.ScheduleResponse.from(saved);
    }

    @Transactional
    public ActivityDtos.ScheduleResponse updateSchedule(Long userId, Long scheduleId, Map<String, Object> updates) {
        Schedule schedule = scheduleRepository.findByIdAndUser_Id(scheduleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found"));
        if (updates.containsKey("title")) {
            schedule.setTitle(asString(updates.get("title")));
        }
        if (updates.containsKey("time")) {
            schedule.setTime(asString(updates.get("time")));
        }
        if (updates.containsKey("type")) {
            schedule.setType(EnumParser.parse(ScheduleType.class, asString(updates.get("type")), schedule.getType()));
        }
        if (updates.containsKey("completed")) {
            schedule.setCompleted(asBoolean(updates.get("completed"), schedule.isCompleted()));
        }
        if (updates.containsKey("date")) {
            schedule.setDate(asString(updates.get("date")));
        }
        if (updates.containsKey("note")) {
            schedule.setNote(asString(updates.get("note")));
        }
        if (updates.containsKey("babyMessage")) {
            schedule.setBabyMessage(asString(updates.get("babyMessage")));
        }
        upsertReminderForSchedule(schedule);
        return ActivityDtos.ScheduleResponse.from(schedule);
    }

    @Transactional
    public void deleteSchedule(Long userId, Long scheduleId) {
        Schedule schedule = scheduleRepository.findByIdAndUser_Id(scheduleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found"));
        scheduleRepository.delete(schedule);
        reminderRepository.deleteBySourceIdAndSourceType(String.valueOf(scheduleId), ReminderSourceType.SCHEDULE);
        reminderRepository.deleteBySourceIdAndSourceType(String.valueOf(scheduleId), ReminderSourceType.MEDICINE);
        reminderRepository.deleteBySourceIdAndSourceType(String.valueOf(scheduleId), ReminderSourceType.VACCINE);
    }

    @Transactional
    public void clearSchedules(Long userId) {
        scheduleRepository.findByUser_IdOrderByTimeAsc(userId).forEach(schedule -> {
            String sourceId = String.valueOf(schedule.getId());
            reminderRepository.deleteBySourceIdAndSourceType(sourceId, ReminderSourceType.SCHEDULE);
            reminderRepository.deleteBySourceIdAndSourceType(sourceId, ReminderSourceType.MEDICINE);
            reminderRepository.deleteBySourceIdAndSourceType(sourceId, ReminderSourceType.VACCINE);
            scheduleRepository.delete(schedule);
        });
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.ReminderResponse> activeReminders(Long userId) {
        List<String> dates = List.of(LocalDate.now().toString(), LocalDate.now().plusDays(1).toString());
        return reminderRepository.findByUser_IdAndSentFalseAndDateInOrderByDateAscTimeAsc(userId, dates).stream()
                .map(ActivityDtos.ReminderResponse::from)
                .toList();
    }

    @Transactional
    public ActivityDtos.ReminderResponse updateReminder(Long userId, Long reminderId, ActivityDtos.ReminderPatchRequest request) {
        Reminder reminder = reminderRepository.findByIdAndUser_Id(reminderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found"));
        reminder.setSent(Boolean.TRUE.equals(request.getSent()));
        return ActivityDtos.ReminderResponse.from(reminder);
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.DiaryEntryResponse> diaryEntries(Long userId) {
        return diaryEntryRepository.findByUser_IdOrderByDateDesc(userId).stream()
                .map(ActivityDtos.DiaryEntryResponse::from)
                .toList();
    }

    @Transactional
    public ActivityDtos.DiaryEntryResponse upsertDiaryEntry(Long userId, ActivityDtos.DiaryEntryRequest request) {
        User user = userService.findById(userId);
        DiaryEntry entry = diaryEntryRepository.findByUser_IdAndDate(userId, request.getDate()).orElseGet(DiaryEntry::new);
        entry.setUser(user);
        entry.setDate(request.getDate());
        entry.setMood(request.getMood());
        entry.setText(request.getText());
        entry.setImageUrls(request.getImageUrls() == null ? List.of() : request.getImageUrls());
        entry.setMedicalConditions(request.getMedicalConditions() == null ? List.of() : request.getMedicalConditions());
        entry.setMilestone(Boolean.TRUE.equals(request.getMilestone()));
        entry.setMilestoneTitle(request.getMilestoneTitle());
        entry.setMilestoneCategory(request.getMilestoneCategory());
        entry.setMilestoneDescription(request.getMilestoneDescription());
        return ActivityDtos.DiaryEntryResponse.from(diaryEntryRepository.save(entry));
    }

    @Transactional
    public void deleteDiaryEntry(Long userId, String date) {
        diaryEntryRepository.deleteByUser_IdAndDate(userId, date);
    }

    @Transactional
    public ActivityDtos.DailyTaskResponse todayTask(Long userId) {
        String today = LocalDate.now().toString();
        DailyTask task = dailyTaskRepository.findByUser_IdAndDate(userId, today)
                .orElseGet(() -> createDailyTask(userService.findById(userId), today));
        return ActivityDtos.DailyTaskResponse.from(task);
    }

    @Transactional(readOnly = true)
    public long completedTaskCount(Long userId) {
        return dailyTaskRepository.countByUser_IdAndStatus(userId, DailyTaskStatus.COMPLETED);
    }

    @Transactional
    public ActivityDtos.DailyTaskResponse updateDailyTask(Long userId, Long taskId, ActivityDtos.DailyTaskPatchRequest request) {
        DailyTask task = dailyTaskRepository.findByIdAndUser_Id(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        task.setStatus(EnumParser.parse(DailyTaskStatus.class, request.getStatus(), task.getStatus()));
        task.setNote(request.getNote());
        return ActivityDtos.DailyTaskResponse.from(task);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dailyCheckupStatus(Long userId) {
        return dailyCheckupRepository.findByUser_IdAndDate(userId, LocalDate.now().toString())
                .<Map<String, Object>>map(checkup -> Map.of(
                        "completed", true,
                        "checkup", ActivityDtos.DailyCheckupResponse.from(checkup)
                ))
                .orElseGet(() -> Map.of("completed", false));
    }

    @Transactional
    public ActivityDtos.DailyCheckupResponse submitDailyCheckup(Long userId, ActivityDtos.DailyCheckupRequest request) {
        User user = userService.findById(userId);
        if (user.getRole() == Role.DOCTOR) {
            throw new ForbiddenException("Daily checkup is available only for mothers and pregnant users");
        }
        if (request.getResponses() == null) {
            throw new IllegalArgumentException("responses are required");
        }
        String today = LocalDate.now().toString();
        DailyCheckup checkup = dailyCheckupRepository.findByUser_IdAndDate(userId, today).orElseGet(DailyCheckup::new);
        checkup.setUser(user);
        checkup.setRole(user.getRole());
        checkup.setDate(today);
        checkup.setPhysicalResponse(request.getResponses().physical());
        checkup.setMentalResponse(request.getResponses().mental());
        checkup.setLifestyleResponse(request.getResponses().lifestyle());
        checkup.setBabyRelatedResponse(request.getResponses().babyRelated());
        return ActivityDtos.DailyCheckupResponse.from(dailyCheckupRepository.save(checkup));
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.CheckupResponse> checkups(Long userId) {
        return checkupRepository.findByPatient_IdOrScheduledBy_IdOrderByDateDesc(userId, userId).stream()
                .map(ActivityDtos.CheckupResponse::from)
                .toList();
    }

    @Transactional
    public ActivityDtos.CheckupResponse scheduleCheckup(Long doctorId, ActivityDtos.CheckupRequest request) {
        User doctor = userService.findById(doctorId);
        if (doctor.getRole() != Role.DOCTOR) {
            throw new ForbiddenException("Only doctors can schedule checkups");
        }
        User patient = requireConnectedPatient(doctorId, EnumParser.parseId(request.getPatientId(), "patientId"));
        Checkup checkup = new Checkup();
        checkup.setPatient(patient);
        checkup.setScheduledBy(doctor);
        checkup.setPatientName(patient.getName());
        checkup.setDate(request.getDate());
        checkup.setType(EnumParser.parse(CheckupType.class, request.getType(), CheckupType.PREGNANCY));
        checkup.setStatus(CheckupStatus.SCHEDULED);
        checkup.setNote(request.getNote());
        checkup.setUrgent(Boolean.TRUE.equals(request.getIsUrgent()));
        Checkup saved = checkupRepository.save(checkup);
        createReminder(patient, ReminderSourceType.DOCTOR, String.valueOf(saved.getId()),
                "Doctor Checkup: " + ActivityDtos.lower(saved.getType()), "10:00", saved.getDate(), null);
        return ActivityDtos.CheckupResponse.from(saved);
    }

    @Transactional
    public ActivityDtos.CheckupResponse requestAppointment(Long userId, ActivityDtos.CheckupRequest request) {
        User patient = userService.findById(userId);
        if (patient.getRole() == Role.DOCTOR) {
            throw new ForbiddenException("Only patients can request appointments");
        }
        Checkup checkup = new Checkup();
        checkup.setPatient(patient);
        checkup.setScheduledBy(patient.getDoctor() == null ? patient : patient.getDoctor());
        checkup.setPatientName(patient.getName());
        checkup.setDate(request.getDate());
        checkup.setType(EnumParser.parse(CheckupType.class, request.getType(), CheckupType.PREGNANCY));
        checkup.setStatus(CheckupStatus.PENDING);
        checkup.setNote(request.getNote());
        checkup.setUrgent(Boolean.TRUE.equals(request.getIsUrgent()));
        return ActivityDtos.CheckupResponse.from(checkupRepository.save(checkup));
    }

    @Transactional
    public ActivityDtos.CheckupResponse updateCheckupStatus(
            Long userId,
            Long checkupId,
            ActivityDtos.CheckupStatusPatchRequest request
    ) {
        Checkup checkup = checkupRepository.findAccessibleById(checkupId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Checkup not found"));
        checkup.setStatus(parseCheckupStatus(request.getStatus()));
        return ActivityDtos.CheckupResponse.from(checkup);
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.MedicalReportResponse> reports(Long userId) {
        return medicalReportRepository.findByPatient_IdOrderByDateDesc(userId).stream()
                .map(ActivityDtos.MedicalReportResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.MedicalReportResponse> reports(Long currentUserId, String patientId) {
        User currentUser = userService.findById(currentUserId);
        if (patientId == null || patientId.isBlank()) {
            if (currentUser.getRole() == Role.DOCTOR) {
                return medicalReportRepository.findByPatient_Doctor_IdOrderByDateDesc(currentUserId).stream()
                        .map(ActivityDtos.MedicalReportResponse::from)
                        .toList();
            }
            return reports(currentUserId);
        }

        Long requestedPatientId = EnumParser.parseId(patientId, "patientId");
        if (currentUser.getRole() == Role.DOCTOR) {
            User patient = requireConnectedPatient(currentUserId, requestedPatientId);
            return medicalReportRepository.findByPatient_IdOrderByDateDesc(patient.getId()).stream()
                    .map(ActivityDtos.MedicalReportResponse::from)
                    .toList();
        }
        if (!currentUserId.equals(requestedPatientId)) {
            throw new ForbiddenException("You can access only your own reports");
        }
        return reports(currentUserId);
    }

    @Transactional
    public ActivityDtos.MedicalReportResponse addReport(Long currentUserId, ActivityDtos.MedicalReportRequest request) {
        User currentUser = userService.findById(currentUserId);
        User patient = resolveReportPatient(currentUser, request.getPatientId());
        MedicalReport report = new MedicalReport();
        report.setPatient(patient);
        report.setDate(request.getDate());
        report.setFileName(request.getFileName());
        report.setFileUrl(request.getFileUrl());
        report.setDoctorName(request.getDoctorName());
        report.setRemarks(request.getRemarks());
        return ActivityDtos.MedicalReportResponse.from(medicalReportRepository.save(report));
    }

    @Transactional
    public void deleteReport(Long userId, Long reportId) {
        User currentUser = userService.findById(userId);
        MedicalReport report = medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical report not found"));
        if (!canAccessPatient(currentUser, report.getPatient())) {
            throw new ResourceNotFoundException("Medical report not found");
        }
        medicalReportRepository.delete(report);
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.DoctorNoteResponse> notes(Long userId) {
        return doctorNoteRepository.findByPatient_IdOrderByDateDesc(userId).stream()
                .map(ActivityDtos.DoctorNoteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.CalendarItemResponse> calendar(Long userId) {
        return calendarItemRepository.findByUser_IdOrderByDateAsc(userId).stream()
                .map(ActivityDtos.CalendarItemResponse::from)
                .toList();
    }

    @Transactional
    public ActivityDtos.CalendarItemResponse createCalendarItem(Long userId, ActivityDtos.CalendarItemRequest request) {
        CalendarItem item = new CalendarItem();
        item.setUser(userService.findById(userId));
        item.setDate(request.getDate());
        item.setCategory(request.getCategory());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        return ActivityDtos.CalendarItemResponse.from(calendarItemRepository.save(item));
    }

    @Transactional
    public ActivityDtos.CalendarItemResponse updateCalendarItem(Long userId, Long id, ActivityDtos.CalendarItemRequest request) {
        CalendarItem item = calendarItemRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar item not found"));
        item.setDate(request.getDate());
        item.setCategory(request.getCategory());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        return ActivityDtos.CalendarItemResponse.from(item);
    }

    @Transactional
    public void deleteCalendarItem(Long userId, Long id) {
        CalendarItem item = calendarItemRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar item not found"));
        calendarItemRepository.delete(item);
    }

    @Transactional
    public ActivityDtos.DoctorRequestResponse sendDoctorRequest(Long patientId, ActivityDtos.DoctorRequestCreateRequest request) {
        User patient = userService.findById(patientId);
        User doctor = userService.findById(EnumParser.parseId(request.getDoctorId(), "doctorId"));
        if (doctor.getRole() != Role.DOCTOR) {
            throw new IllegalArgumentException("Selected user is not a doctor");
        }
        boolean exists = doctorRequestRepository.existsByPatient_IdAndDoctor_IdAndStatusIn(
                patient.getId(),
                doctor.getId(),
                Set.of(DoctorRequestStatus.PENDING, DoctorRequestStatus.ACCEPTED)
        );
        if (exists) {
            throw new IllegalArgumentException("Request already exists");
        }
        DoctorRequest doctorRequest = new DoctorRequest();
        doctorRequest.setPatient(patient);
        doctorRequest.setDoctor(doctor);
        doctorRequest.setPatientName(patient.getName());
        doctorRequest.setDoctorName(doctor.getName());
        doctorRequest.setStatus(DoctorRequestStatus.PENDING);
        return ActivityDtos.DoctorRequestResponse.from(doctorRequestRepository.save(doctorRequest));
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.DoctorRequestResponse> pendingDoctorRequests(Long doctorId) {
        return doctorRequestRepository.findByDoctor_IdAndStatusOrderByRequestDateDesc(doctorId, DoctorRequestStatus.PENDING)
                .stream()
                .map(ActivityDtos.DoctorRequestResponse::from)
                .toList();
    }

    @Transactional
    public ActivityDtos.DoctorRequestResponse respondToDoctorRequest(
            Long doctorId,
            Long requestId,
            ActivityDtos.DoctorRequestPatchRequest patch
    ) {
        DoctorRequest request = doctorRequestRepository.findByIdAndDoctor_Id(requestId, doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        DoctorRequestStatus status = EnumParser.parse(DoctorRequestStatus.class, patch.getStatus(), DoctorRequestStatus.PENDING);
        if (status == DoctorRequestStatus.PENDING) {
            throw new IllegalArgumentException("status must be accepted or rejected");
        }
        request.setStatus(status);
        request.setResponseDate(java.time.Instant.now());
        if (status == DoctorRequestStatus.ACCEPTED) {
            request.getPatient().setDoctor(request.getDoctor());
        }
        return ActivityDtos.DoctorRequestResponse.from(request);
    }

    @Transactional
    public ActivityDtos.DietPlanProgressResponse saveDietPlanProgress(
            Long userId,
            ActivityDtos.DietPlanProgressRequest request
    ) {
        User user = userService.findById(userId);
        DietPlanProgress progress = dietPlanProgressRepository.findByUser_IdAndDate(userId, request.getDate())
                .orElseGet(DietPlanProgress::new);
        progress.setUser(user);
        progress.setDate(request.getDate());
        progress.setSectionsJson(writeJson(request.getSections()));
        return ActivityDtos.DietPlanProgressResponse.from(
                dietPlanProgressRepository.save(progress),
                request.getSections()
        );
    }

    @Transactional(readOnly = true)
    public ActivityDtos.DietPlanProgressResponse latestDietPlanProgress(Long userId) {
        return dietPlanProgressRepository.findTopByUser_IdOrderByDateDesc(userId)
                .map(progress -> ActivityDtos.DietPlanProgressResponse.from(progress, readSections(progress.getSectionsJson())))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.FoodIntroEntryResponse> foodIntroHistory(Long userId) {
        requireBaby(userId);
        return foodIntroEntryRepository.findByUser_IdOrderByIntroductionDateDescCreatedAtDesc(userId).stream()
                .map(ActivityDtos.FoodIntroEntryResponse::from)
                .toList();
    }

    @Transactional
    public ActivityDtos.FoodIntroEntryResponse addFoodIntroEntry(Long userId, ActivityDtos.FoodIntroEntryRequest request) {
        Baby baby = requireBaby(userId);
        String reaction = request.getReaction().trim().toLowerCase();
        if (!VALID_FOOD_REACTIONS.contains(reaction)) {
            throw new IllegalArgumentException("reaction must be good, bad, gas, constipation, allergy, or rash");
        }
        FoodIntroEntry entry = new FoodIntroEntry();
        entry.setUser(baby.getUser());
        entry.setBaby(baby);
        entry.setFoodName(request.getFoodName().trim());
        entry.setIntroductionDate(request.getIntroductionDate());
        entry.setReaction(reaction);
        entry.setNotes(request.getNotes());
        return ActivityDtos.FoodIntroEntryResponse.from(foodIntroEntryRepository.save(entry));
    }

    @Transactional
    public void deleteFoodIntroEntry(Long userId, Long entryId) {
        FoodIntroEntry entry = foodIntroEntryRepository.findByIdAndUser_Id(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Food introduction entry not found"));
        foodIntroEntryRepository.delete(entry);
    }

    @Transactional
    public ActivityDtos.BabyDietPlanResponse saveBabyDietPlan(Long userId, ActivityDtos.BabyDietPlanRequest request) {
        Baby baby = requireBaby(userId);
        BabyDietPlan plan = babyDietPlanRepository.findByUser_Id(userId).orElseGet(BabyDietPlan::new);
        plan.setUser(baby.getUser());
        plan.setBaby(baby);
        plan.setPlan(request.getPlan());
        plan.setBabyAgeWeeks(request.getBabyAgeWeeks());
        plan.setGeneratedAt(request.getGeneratedAt() == null ? java.time.Instant.now() : request.getGeneratedAt());
        return ActivityDtos.BabyDietPlanResponse.from(babyDietPlanRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public ActivityDtos.BabyDietPlanResponse babyDietPlan(Long userId) {
        requireBaby(userId);
        return babyDietPlanRepository.findByUser_Id(userId)
                .map(ActivityDtos.BabyDietPlanResponse::from)
                .orElse(null);
    }

    private DailyTask createDailyTask(User user, String date) {
        DailyTask task = new DailyTask();
        task.setUser(user);
        task.setDate(date);
        task.setStatus(DailyTaskStatus.PENDING);
        try {
            task.setTask(groqService.generateDailyTask(UserProfileDto.from(user)));
        } catch (RuntimeException ex) {
            task.setTask("Complete one small health-supporting action today.");
        }
        return dailyTaskRepository.save(task);
    }

    private void upsertReminderForSchedule(Schedule schedule) {
        ReminderSourceType sourceType = switch (schedule.getType()) {
            case MEDICATION -> ReminderSourceType.MEDICINE;
            case VACCINATION -> ReminderSourceType.VACCINE;
            default -> ReminderSourceType.SCHEDULE;
        };
        if (sourceType == ReminderSourceType.SCHEDULE && schedule.getDate() == null) {
            return;
        }
        createReminder(
                schedule.getUser(),
                sourceType,
                String.valueOf(schedule.getId()),
                schedule.getTitle(),
                schedule.getTime(),
                schedule.getDate() == null ? LocalDate.now().toString() : schedule.getDate(),
                schedule.getBabyMessage()
        );
    }

    private void createReminder(
            User user,
            ReminderSourceType sourceType,
            String sourceId,
            String title,
            String time,
            String date,
            String babyMessage
    ) {
        Reminder reminder = reminderRepository
                .findByUser_IdAndSourceIdAndSourceTypeAndDate(user.getId(), sourceId, sourceType, date)
                .orElseGet(Reminder::new);
        reminder.setUser(user);
        reminder.setSourceType(sourceType);
        reminder.setSourceId(sourceId);
        reminder.setTitle(title);
        reminder.setTime(time);
        reminder.setDate(date);
        reminder.setBabyMessage(babyMessage);
        reminderRepository.save(reminder);
    }

    private User resolveReportPatient(User currentUser, String patientId) {
        if (currentUser.getRole() == Role.DOCTOR) {
            if (patientId == null || patientId.isBlank()) {
                throw new IllegalArgumentException("patientId is required for doctor report uploads");
            }
            return requireConnectedPatient(currentUser.getId(), EnumParser.parseId(patientId, "patientId"));
        }
        if (patientId != null && !patientId.isBlank() && !currentUser.getId().equals(EnumParser.parseId(patientId, "patientId"))) {
            throw new ForbiddenException("You can add reports only to your own profile");
        }
        return currentUser;
    }

    private User requireConnectedPatient(Long doctorId, Long patientId) {
        User patient = userService.findById(patientId);
        if (patient.getRole() == Role.DOCTOR) {
            throw new ForbiddenException("Doctors cannot be used as patients");
        }
        if (patient.getDoctor() == null || !doctorId.equals(patient.getDoctor().getId())) {
            throw new ForbiddenException("Patient is not connected to this doctor");
        }
        return patient;
    }

    private boolean canAccessPatient(User currentUser, User patient) {
        return currentUser.getId().equals(patient.getId())
                || (currentUser.getRole() == Role.DOCTOR
                && patient.getDoctor() != null
                && currentUser.getId().equals(patient.getDoctor().getId()));
    }

    private Baby requireBaby(Long userId) {
        Baby baby = userService.findById(userId).getBaby();
        if (baby == null) {
            throw new ResourceNotFoundException("Baby profile is required for this feature");
        }
        return baby;
    }

    private CheckupStatus parseCheckupStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("status is required");
        }
        try {
            return CheckupStatus.valueOf(status.trim().replace('-', '_').toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("status must be scheduled, completed, cancelled, or pending");
        }
    }

    private String writeJson(List<Map<String, Object>> sections) {
        try {
            return objectMapper.writeValueAsString(sections);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Invalid diet progress payload");
        }
    }

    private List<Map<String, Object>> readSections(String sectionsJson) {
        try {
            return objectMapper.readValue(sectionsJson, new TypeReference<>() {
            });
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Stored diet progress payload is invalid");
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private boolean asBoolean(Object value, boolean fallback) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value instanceof String text) {
            return Boolean.parseBoolean(text);
        }
        return fallback;
    }
}
