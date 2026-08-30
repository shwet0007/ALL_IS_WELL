package com.aalliswell.service;

import com.aalliswell.exception.ExternalServiceException;
import java.util.Base64;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class SarvamService {

    private final WebClient webClient;
    private final String apiKey;

    public SarvamService(
            WebClient.Builder webClientBuilder,
            @Value("${app.sarvam.base-url}") String baseUrl,
            @Value("${app.sarvam.api-key}") String apiKey
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public String speechToText(String audioData, String language) {
        requireKey();
        byte[] audio = Base64.getDecoder().decode(audioData);
        ByteArrayResource resource = new ByteArrayResource(audio) {
            @Override
            public String getFilename() {
                return "audio.wav";
            }
        };

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", resource).contentType(MediaType.valueOf("audio/wav"));
        builder.part("language_code", language == null ? "en-IN" : language);

        Map<String, Object> response = webClient.post()
                .uri("/speech-to-text")
                .header("api-subscription-key", apiKey)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new ExternalServiceException("Sarvam speech-to-text failed: " + body))))
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                })
                .block();

        Object transcript = response == null ? null : response.get("transcript");
        return transcript == null ? "" : String.valueOf(transcript);
    }

    public String textToSpeech(String text, String language, String speaker) {
        requireKey();
        Map<String, Object> payload = Map.of(
                "text", text,
                "language_code", language == null ? "en-IN" : language,
                "speaker", speaker == null ? "meera" : speaker,
                "pitch", 0,
                "pace", 1.0,
                "loudness", 1.5,
                "speech_sample_rate", 22050,
                "enable_preprocessing", true,
                "model", "bulbul:v2"
        );

        Map<String, Object> response = webClient.post()
                .uri("/text-to-speech")
                .header("api-subscription-key", apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(payload)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new ExternalServiceException("Sarvam text-to-speech failed: " + body))))
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                })
                .block();

        if (response == null) {
            return "";
        }
        Object audio = response.get("audio");
        if (audio == null) {
            audio = response.get("base64_audio");
        }
        if (audio == null && response.get("audios") instanceof java.util.List<?> audios && !audios.isEmpty()) {
            audio = audios.get(0);
        }
        return audio == null ? "" : String.valueOf(audio);
    }

    private void requireKey() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ExternalServiceException("SARVAM_API_KEY is not configured");
        }
    }
}
