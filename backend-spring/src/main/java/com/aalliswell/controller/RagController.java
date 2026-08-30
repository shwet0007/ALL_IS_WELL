package com.aalliswell.controller;

import com.aalliswell.dto.activity.AiDtos;
import com.aalliswell.service.RagService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/query")
    public Map<String, Object> query(@Valid @RequestBody AiDtos.RagQueryRequest request) {
        return ragService.query(request.getQuestion(), request.getLanguage(), request.getUserProfile());
    }
}
