package com.aalliswell.scheduler;

import com.aalliswell.service.ReminderDeliveryService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReminderScheduler {

    private final ReminderDeliveryService reminderDeliveryService;

    public ReminderScheduler(ReminderDeliveryService reminderDeliveryService) {
        this.reminderDeliveryService = reminderDeliveryService;
    }

    @Scheduled(fixedDelayString = "${app.schedulers.reminders.fixed-delay-ms:60000}")
    public void deliverDueReminders() {
        reminderDeliveryService.deliverDueReminders();
    }
}
