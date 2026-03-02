package com.smartparking.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    @jakarta.validation.constraints.Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", message = "Password must be at least 8 characters and include uppercase, lowercase and number")
    private String newPassword;
    private String otp;
}
