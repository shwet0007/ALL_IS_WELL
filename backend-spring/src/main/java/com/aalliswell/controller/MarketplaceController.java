package com.aalliswell.controller;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.service.MarketplaceService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping("/products")
    public Map<String, Object> products(@RequestParam(required = false) String category) {
        return Map.of("products", marketplaceService.products(category));
    }

    @PostMapping("/products")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, Object> createProduct(@Valid @RequestBody ActivityDtos.ProductRequest request) {
        return Map.of("success", true, "product", marketplaceService.create(request));
    }

    @PostMapping("/seed")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, Object> seed() {
        return Map.of("success", true, "count", marketplaceService.seed());
    }
}
