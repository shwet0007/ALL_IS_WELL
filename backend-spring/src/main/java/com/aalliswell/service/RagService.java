package com.aalliswell.service;

import com.aalliswell.exception.ExternalServiceException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class RagService {

    private final WebClient webClient;

    public RagService(WebClient.Builder webClientBuilder, @Value("${app.rag.service-url}") String serviceUrl) {
        this.webClient = webClientBuilder.baseUrl(serviceUrl).build();
    }

    public Map<String, Object> query(String question, String language, Map<String, Object> userProfile) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("question", question);
        payload.put("language", language == null ? "en" : language);
        payload.put("userProfile", userProfile);

        Map<String, Object> response = webClient.post()
                .uri("/query")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new ExternalServiceException("RAG service failed: " + body))))
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                })
                .block();

        if (response == null) {
            throw new ExternalServiceException("RAG service returned an empty response");
        }
        return response;
    }
}
