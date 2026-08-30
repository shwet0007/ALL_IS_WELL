package com.aalliswell.controller;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.security.SecurityUtils;
import com.aalliswell.service.CryAnalysisService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({"/api/cry-analysis", "/api/cry"})
public class CryAnalysisController {

    private final CryAnalysisService cryAnalysisService;

    public CryAnalysisController(CryAnalysisService cryAnalysisService) {
        this.cryAnalysisService = cryAnalysisService;
    }

    @PostMapping("/analyze")
    public ActivityDtos.CryAnalysisResponse analyze(@RequestParam("audio") MultipartFile file) {
        return cryAnalysisService.analyze(SecurityUtils.currentUserId(), file);
    }
}
