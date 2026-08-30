package com.aalliswell.service;

import com.aalliswell.dto.user.UserProfileDto;
import com.aalliswell.exception.ExternalServiceException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class GroqService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GroqService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${app.groq.base-url}") String baseUrl,
            @Value("${app.groq.api-key}") String apiKey,
            @Value("${app.groq.model}") String model
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public String getChatCompletion(String prompt, String language, Map<String, Object> userProfile, String currentPage) {
        String systemPrompt = """
                You are Aal Is Well, a maternal and infant health awareness assistant.
                Never diagnose. For emergency red flags, tell the user to contact a doctor or hospital.
                Keep responses brief and respond in the requested language.
                """;
        if (currentPage != null && !currentPage.isBlank()) {
            systemPrompt += "\nCurrent page: " + currentPage;
        }
        if (userProfile != null && !userProfile.isEmpty()) {
            systemPrompt += "\nUser profile context: " + userProfile;
        }
        systemPrompt += "\nLanguage: " + (language == null ? "en" : language);
        return completion(systemPrompt, prompt, 350);
    }

    public Object generateSchedule(Map<String, Object> userProfile) {
        String prompt = """
                Generate a JSON array with 5 to 7 daily schedule items.
                Each item must contain title, time, type, and note.
                Allowed types: feeding, sleep, medication, checkup, vaccination, other.
                Return JSON only.
                User profile:
                """ + userProfile;
        return parseJsonArray(completion("Return valid JSON only.", prompt, 900));
    }

    public Object generateDiet(Map<String, Object> userProfile) {
        String prompt = """
                Generate a JSON array for a maternal daily diet plan with 6 meal sections.
                Each section should include title and items.
                Return JSON only.
                User profile:
                """ + userProfile;
        return parseJsonArray(completion("Return valid JSON only.", prompt, 1200));
    }

    public Object generateBabyDiet(Map<String, Object> userProfile) {
        String prompt = """
                Generate a JSON array for a baby diet plan based on age and feeding preference.
                Return JSON only.
                User profile:
                """ + userProfile;
        return parseJsonArray(completion("Return valid JSON only.", prompt, 900));
    }

    public String getDiseaseAwareness(String prompt, String language, Map<String, Object> userProfile) {
        String systemPrompt = "Provide safe disease awareness for maternal or infant care. Do not diagnose. Language: " + language;
        return completion(systemPrompt, prompt + "\nUser profile: " + userProfile, 450);
    }

    public Object getVaccineSuggestions(Map<String, Object> userProfile) {
        return parseJsonArray(completion(
                "Return valid JSON only.",
                "Suggest upcoming infant vaccinations as a JSON array. User profile: " + userProfile,
                900
        ));
    }

    public Object getPregnancyCheckups(Map<String, Object> userProfile) {
        return parseJsonArray(completion(
                "Return valid JSON only.",
                "Suggest pregnancy checkups as a JSON array. User profile: " + userProfile,
                900
        ));
    }

    public String generateDailyTask(UserProfileDto userProfile) {
        return completion(
                "Return one short practical daily care task. No markdown.",
                "Generate one task for this user profile: " + userProfile.getRole(),
                120
        );
    }

    private String completion(String systemPrompt, String userPrompt, int maxTokens) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ExternalServiceException("GROQ_API_KEY is not configured");
        }
        Map<String, Object> request = Map.of(
                "model", model,
                "temperature", 0.7,
                "max_tokens", maxTokens,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        Map<String, Object> response = webClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new ExternalServiceException("Groq API error: " + body))))
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                })
                .block();

        return extractContent(response);
    }

    private String extractContent(Map<String, Object> response) {
        if (response == null) {
            throw new ExternalServiceException("Groq returned an empty response");
        }
        Object choicesValue = response.get("choices");
        if (!(choicesValue instanceof List<?> choices) || choices.isEmpty()) {
            throw new ExternalServiceException("Groq response did not include choices");
        }
        Object first = choices.get(0);
        if (!(first instanceof Map<?, ?> firstChoice)) {
            throw new ExternalServiceException("Groq response choice was invalid");
        }
        Object message = firstChoice.get("message");
        if (!(message instanceof Map<?, ?> messageMap)) {
            throw new ExternalServiceException("Groq response message was invalid");
        }
        Object content = messageMap.get("content");
        return content == null ? "" : String.valueOf(content);
    }

    private Object parseJsonArray(String content) {
        String json = extractJsonArray(content);
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {
            });
        } catch (JsonProcessingException ex) {
            throw new ExternalServiceException("AI response was not valid JSON", ex);
        }
    }

    private String extractJsonArray(String content) {
        int start = content.indexOf('[');
        int end = content.lastIndexOf(']');
        if (start >= 0 && end > start) {
            return content.substring(start, end + 1);
        }
        return content;
    }
}
