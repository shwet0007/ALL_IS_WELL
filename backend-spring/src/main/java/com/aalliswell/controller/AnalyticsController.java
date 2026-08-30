package com.aalliswell.controller;

import com.aalliswell.security.SecurityUtils;
import com.aalliswell.service.AnalyticsService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard-advanced")
    public Map<String, Object> dashboardAdvanced() {
        return analyticsService.dashboardAdvanced(SecurityUtils.currentUserId());
    }

    @GetMapping("/monthly-report/{month}")
    public Map<String, Object> monthlyReport(@PathVariable String month) {
        return Map.of("report", analyticsService.monthlyReport(SecurityUtils.currentUserId(), month));
    }

    @GetMapping("/achievements")
    public Map<String, Object> achievements() {
        return Map.of("achievements", analyticsService.achievements(SecurityUtils.currentUserId()));
    }
}
