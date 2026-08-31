package com.aalliswell.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

class RagServiceTest {

    @Test
    void sendsPythonRagPayload() {
        RagService service = new RagService(WebClient.builder(), "http://localhost:9000");

        Map<String, Object> payload = service.buildPythonRagPayload(
                "What care should be taken during pregnancy?",
                Map.of("role", "pregnant")
        );

        assertThat(payload)
                .containsEntry("query", "What care should be taken during pregnancy?")
                .containsEntry("user_role", "pregnant")
                .doesNotContainKeys("question", "userProfile");
    }
}
