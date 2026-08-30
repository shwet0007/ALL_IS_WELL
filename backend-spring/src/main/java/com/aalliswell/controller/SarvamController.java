package com.aalliswell.controller;

import com.aalliswell.dto.activity.AiDtos;
import com.aalliswell.service.SarvamService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sarvam")
public class SarvamController {

    private final SarvamService sarvamService;

    public SarvamController(SarvamService sarvamService) {
        this.sarvamService = sarvamService;
    }

    @PostMapping("/speech-to-text")
    public Map<String, Object> speechToText(@Valid @RequestBody AiDtos.SarvamSpeechToTextRequest request) {
        return Map.of("transcript", sarvamService.speechToText(request.getAudioData(), request.getLanguage()));
    }

    @PostMapping("/text-to-speech")
    public Map<String, Object> textToSpeech(@Valid @RequestBody AiDtos.SarvamTextToSpeechRequest request) {
        return Map.of("audio", sarvamService.textToSpeech(request.getText(), request.getLanguage(), request.getSpeaker()));
    }
}
