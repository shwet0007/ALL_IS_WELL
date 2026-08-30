package com.aalliswell.service;

import com.aalliswell.entity.User;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class FcmNotificationService {

    private final WebClient webClient;
    private final String serverKey;

    public FcmNotificationService(
            WebClient.Builder webClientBuilder,
            @Value("${app.fcm.endpoint}") String endpoint,
            @Value("${app.fcm.server-key}") String serverKey
    ) {
        this.webClient = webClientBuilder.baseUrl(endpoint).build();
        this.serverKey = serverKey;
    }

    public boolean send(User user, String title, String message) {
        if (serverKey == null || serverKey.isBlank() || user.getFcmToken() == null || user.getFcmToken().isBlank()) {
            return false;
        }

        Map<String, Object> payload = Map.of(
                "to", user.getFcmToken(),
                "notification", Map.of(
                        "title", title,
                        "body", message == null ? "" : message
                ),
                "data", Map.of(
                        "title", title,
                        "message", message == null ? "" : message
                )
        );

        webClient.post()
                .header(HttpHeaders.AUTHORIZATION, "key=" + serverKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .toBodilessEntity()
                .block();
        return true;
    }
}
