package com.aalliswell.service;

import com.aalliswell.entity.Reminder;
import com.aalliswell.enums.NotificationSourceType;
import com.aalliswell.enums.ReminderSourceType;
import com.aalliswell.repository.ReminderRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReminderDeliveryService {

    private final ReminderRepository reminderRepository;
    private final NotificationService notificationService;

    public ReminderDeliveryService(ReminderRepository reminderRepository, NotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void deliverDueReminders() {
        String today = LocalDate.now().toString();
        String now = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));

        reminderRepository.findBySentFalse().stream()
                .filter(reminder -> isDue(reminder, today, now))
                .forEach(this::deliver);
    }

    private boolean isDue(Reminder reminder, String today, String now) {
        return reminder.getDate().compareTo(today) < 0
                || (reminder.getDate().equals(today) && reminder.getTime().compareTo(now) <= 0);
    }

    private void deliver(Reminder reminder) {
        notificationService.notifyUser(
                reminder.getUser(),
                reminder.getTitle(),
                reminder.getBabyMessage(),
                notificationType(reminder.getSourceType()),
                reminder.getSourceId()
        );
        reminder.setSent(true);
    }

    private NotificationSourceType notificationType(ReminderSourceType sourceType) {
        return switch (sourceType) {
            case DOCTOR -> NotificationSourceType.DOCTOR;
            case VACCINE -> NotificationSourceType.VACCINE;
            case MEDICINE -> NotificationSourceType.MEDICINE;
            case SCHEDULE -> NotificationSourceType.SCHEDULE;
        };
    }
}
