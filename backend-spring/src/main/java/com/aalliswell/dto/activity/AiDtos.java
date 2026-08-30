package com.aalliswell.dto.activity;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

public final class AiDtos {

    private AiDtos() {
    }

    @Getter
    @Setter
    public static class ChatRequest {
        @NotBlank
        private String prompt;
        private String language = "en";
        private Map<String, Object> userProfile;
        private String currentPage;
    }

    @Getter
    @Setter
    public static class ProfileAiRequest {
        private Map<String, Object> userProfile;
    }

    @Getter
    @Setter
    public static class SarvamSpeechToTextRequest {
        @NotBlank
        private String audioData;
        private String language = "en-IN";
    }

    @Getter
    @Setter
    public static class SarvamTextToSpeechRequest {
        @NotBlank
        private String text;
        private String language = "en-IN";
        private String speaker = "meera";
    }

    @Getter
    @Setter
    public static class RagQueryRequest {
        @NotBlank
        private String question;
        private String language = "en";
        private Map<String, Object> userProfile;
    }
}
