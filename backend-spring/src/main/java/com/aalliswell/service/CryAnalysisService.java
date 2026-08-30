package com.aalliswell.service;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.entity.CryLog;
import com.aalliswell.entity.User;
import com.aalliswell.exception.ExternalServiceException;
import com.aalliswell.repository.CryLogRepository;
import java.time.Instant;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class CryAnalysisService {

    private final WebClient webClient;
    private final UserService userService;
    private final CryLogRepository cryLogRepository;

    public CryAnalysisService(
            WebClient.Builder webClientBuilder,
            @Value("${app.cry-analysis.service-url}") String serviceUrl,
            UserService userService,
            CryLogRepository cryLogRepository
    ) {
        this.webClient = webClientBuilder.baseUrl(serviceUrl).build();
        this.userService = userService;
        this.cryLogRepository = cryLogRepository;
    }

    @Transactional
    public ActivityDtos.CryAnalysisResponse analyze(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No audio file uploaded");
        }
        Map<String, Object> response = callPythonService(file);
        String pattern = String.valueOf(response.getOrDefault("pattern", "Unavailable"));
        Double confidence = parseDouble(response.get("confidence"));
        String message = parentFriendlyMessage(pattern);

        User user = userService.findById(userId);
        CryLog log = new CryLog();
        log.setUser(user);
        log.setPattern(pattern);
        log.setConfidence(confidence == null ? 0 : confidence);
        log.setTimestamp(Instant.now());
        cryLogRepository.save(log);

        return new ActivityDtos.CryAnalysisResponse(pattern, confidence, message);
    }

    private Map<String, Object> callPythonService(MultipartFile file) {
        try {
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() == null ? "audio.wav" : file.getOriginalFilename();
                }
            };

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", resource).contentType(MediaType.APPLICATION_OCTET_STREAM);

            Map<String, Object> response = webClient.post()
                    .uri("/analyze")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .onStatus(status -> !status.is2xxSuccessful(), clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .flatMap(body -> Mono.error(new ExternalServiceException("Cry analysis service failed: " + body))))
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();
            if (response == null) {
                throw new ExternalServiceException("Cry analysis service returned an empty response");
            }
            return response;
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ExternalServiceException("Cry analysis service is unavailable", ex);
        }
    }

    private String parentFriendlyMessage(String pattern) {
        return switch (pattern) {
            case "Hunger-related" -> "This sound may be associated with hunger. You may try checking if baby needs feeding.";
            case "Sleep-related" -> "This sound may be associated with tiredness. You may try soothing the baby for sleep.";
            case "Discomfort-related" -> "This sound may be associated with discomfort. You may try burping or changing position.";
            default -> "Cry pattern is mixed. Please observe feeding, sleep, and comfort.";
        };
    }

    private Double parseDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Double.parseDouble(text);
        }
        return null;
    }
}
