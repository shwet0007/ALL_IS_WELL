package com.aalliswell.service;

import com.aalliswell.entity.User;
import com.aalliswell.repository.UserRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

@Service
public class FcmNotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(FcmNotificationService.class);

    private final ObjectProvider<FirebaseMessaging> firebaseMessagingProvider;
    private final UserRepository userRepository;

    public FcmNotificationService(
            ObjectProvider<FirebaseMessaging> firebaseMessagingProvider,
            UserRepository userRepository
    ) {
        this.firebaseMessagingProvider = firebaseMessagingProvider;
        this.userRepository = userRepository;
    }

    public boolean send(User user, String title, String message) {
        return send(user, title, message, Map.of());
    }

    public boolean send(User user, String title, String message, Map<String, String> customData) {
        FirebaseMessaging firebaseMessaging = firebaseMessagingProvider.getIfAvailable();
        if (firebaseMessaging == null || user.getFcmToken() == null || user.getFcmToken().isBlank()) {
            return false;
        }

        Map<String, String> data = new HashMap<>();
        data.put("title", title == null ? "" : title);
        data.put("message", message == null ? "" : message);
        if (customData != null) {
            customData.forEach((key, value) -> data.put(key, value == null ? "" : value));
        }

        Message fcmMessage = Message.builder()
                .setToken(user.getFcmToken())
                .setNotification(com.google.firebase.messaging.Notification.builder()
                        .setTitle(title == null ? "" : title)
                        .setBody(message == null ? "" : message)
                        .build())
                .putAllData(data)
                .build();

        try {
            firebaseMessaging.send(fcmMessage);
            return true;
        } catch (FirebaseMessagingException ex) {
            if (isInvalidToken(ex)) {
                clearInvalidToken(user);
                LOGGER.warn("Cleared invalid FCM token for user {}", user.getId());
                return false;
            }
            LOGGER.warn("FCM notification failed for user {}: {}", user.getId(), ex.getMessage());
            return false;
        } catch (RuntimeException ex) {
            LOGGER.warn("FCM notification failed for user {}: {}", user.getId(), ex.getMessage());
            return false;
        }
    }

    private boolean isInvalidToken(FirebaseMessagingException ex) {
        return ex.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED
                || ex.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT;
    }

    private void clearInvalidToken(User user) {
        user.setFcmToken(null);
        userRepository.save(user);
    }
}
