package com.aalliswell.controller;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.security.SecurityUtils;
import com.aalliswell.service.TwilioService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/call")
public class CallController {

    private final TwilioService twilioService;

    public CallController(TwilioService twilioService) {
        this.twilioService = twilioService;
    }

    @PostMapping("/emergency")
    public ActivityDtos.EmergencyCallResponse emergency(@RequestBody ActivityDtos.EmergencyCallRequest request) {
        String callSid = twilioService.makeEmergencyCall(
                SecurityUtils.currentUserId(),
                request.to(),
                request.name(),
                request.location()
        );
        return new ActivityDtos.EmergencyCallResponse(true, "Emergency call initiated", callSid);
    }
}
