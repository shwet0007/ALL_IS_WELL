package com.aalliswell.controller;

import com.aalliswell.dto.activity.AiDtos;
import com.aalliswell.service.GroqService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groq")
public class GroqController {

    private final GroqService groqService;

    public GroqController(GroqService groqService) {
        this.groqService = groqService;
    }

    @PostMapping("/chat")
    public Map<String, Object> chat(@Valid @RequestBody AiDtos.ChatRequest request) {
        return Map.of("response", groqService.getChatCompletion(
                request.getPrompt(),
                request.getLanguage(),
                request.getUserProfile(),
                request.getCurrentPage()
        ));
    }

    @PostMapping("/schedule")
    public Map<String, Object> schedule(@RequestBody AiDtos.ProfileAiRequest request) {
        return Map.of("schedule", groqService.generateSchedule(request.getUserProfile()));
    }

    @PostMapping("/diet")
    public Map<String, Object> diet(@RequestBody AiDtos.ProfileAiRequest request) {
        return Map.of("diet", groqService.generateDiet(request.getUserProfile()));
    }

    @PostMapping("/baby-diet")
    public Map<String, Object> babyDiet(@RequestBody AiDtos.ProfileAiRequest request) {
        return Map.of("babyDiet", groqService.generateBabyDiet(request.getUserProfile()));
    }

    @PostMapping("/disease-awareness")
    public Map<String, Object> diseaseAwareness(@Valid @RequestBody AiDtos.ChatRequest request) {
        return Map.of("response", groqService.getDiseaseAwareness(
                request.getPrompt(),
                request.getLanguage(),
                request.getUserProfile()
        ));
    }

    @PostMapping("/vaccine-suggestions")
    public Map<String, Object> vaccineSuggestions(@RequestBody AiDtos.ProfileAiRequest request) {
        return Map.of("vaccines", groqService.getVaccineSuggestions(request.getUserProfile()));
    }

    @PostMapping("/pregnancy-checkups")
    public Map<String, Object> pregnancyCheckups(@RequestBody AiDtos.ProfileAiRequest request) {
        return Map.of("checkups", groqService.getPregnancyCheckups(request.getUserProfile()));
    }
}
