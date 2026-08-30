package com.aalliswell.service;

import com.aalliswell.entity.EmergencyLog;
import com.aalliswell.entity.User;
import com.aalliswell.exception.ExternalServiceException;
import com.aalliswell.repository.EmergencyLogRepository;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class TwilioService {

    private final WebClient webClient;
    private final EmergencyLogRepository emergencyLogRepository;
    private final UserService userService;
    private final String accountSid;
    private final String authToken;
    private final String fromNumber;

    public TwilioService(
            WebClient.Builder webClientBuilder,
            EmergencyLogRepository emergencyLogRepository,
            UserService userService,
            @Value("${app.twilio.account-sid}") String accountSid,
            @Value("${app.twilio.auth-token}") String authToken,
            @Value("${app.twilio.phone-number}") String fromNumber
    ) {
        this.webClient = webClientBuilder.baseUrl("https://api.twilio.com").build();
        this.emergencyLogRepository = emergencyLogRepository;
        this.userService = userService;
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
    }

    @Transactional
    public String makeEmergencyCall(Long userId, String to, String name, String location) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient phone number 'to' is required");
        }
        String sid = callTwilio(to, name);

        User user = userService.findById(userId);
        EmergencyLog log = new EmergencyLog();
        log.setUser(user);
        log.setTimestamp(Instant.now());
        log.setContactCalled(name == null || name.isBlank() ? "Unknown User" : name);
        log.setContactPhone(to);
        log.setLocation(location);
        emergencyLogRepository.save(log);
        return sid;
    }

    private String callTwilio(String to, String name) {
        if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank() || fromNumber == null || fromNumber.isBlank()) {
            throw new ExternalServiceException("Twilio credentials are not configured");
        }
        String twiml = "<Response><Say>Emergency alert from Aal Is Well for "
                + escapeXml(name == null ? "a user" : name)
                + ". Please contact them immediately.</Say></Response>";
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("To", to);
        form.add("From", fromNumber);
        form.add("Twiml", twiml);

        var response = webClient.post()
                .uri("/2010-04-01/Accounts/{sid}/Calls.json", accountSid)
                .header("Authorization", basicAuth())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new ExternalServiceException("Twilio call failed: " + body))))
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {
                })
                .block();

        Object sid = response == null ? null : response.get("sid");
        return sid == null ? "" : String.valueOf(sid);
    }

    private String basicAuth() {
        String token = accountSid + ":" + authToken;
        return "Basic " + Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }

    private String escapeXml(String text) {
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
