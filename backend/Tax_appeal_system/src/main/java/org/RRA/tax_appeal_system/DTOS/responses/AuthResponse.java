package org.RRA.tax_appeal_system.DTOS.responses;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record AuthResponse(
        UUID id,
        @NotBlank(message = "full names required")
        String fullNames,
        @NotBlank(message = "email required")
        String email,
        @NotBlank(message = "role required")
        String role,
        String accessToken,
        String refreshToken,
        boolean isProxy
) {
}
