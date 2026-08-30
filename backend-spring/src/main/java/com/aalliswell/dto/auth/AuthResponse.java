package com.aalliswell.dto.auth;

import com.aalliswell.dto.user.UserProfileDto;

public record AuthResponse(
        String accessToken,
        UserProfileDto user
) {
}
