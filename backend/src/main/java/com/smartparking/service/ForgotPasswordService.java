package com.smartparking.service;

import com.smartparking.dto.ResetPasswordRequest;
import com.smartparking.entity.Otp;
import com.smartparking.entity.User;
import com.smartparking.repository.OtpRepository;
import com.smartparking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void generateAndSendOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("User not found with email: " + email);
        }

        String otpCode = generateOtp();
        String hashedOtp = passwordEncoder.encode(otpCode);
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        Optional<Otp> existingOtp = otpRepository.findByEmail(email);
        if (existingOtp.isPresent()) {
            Otp otp = existingOtp.get();
            otp.setOtp(hashedOtp);
            otp.setExpiryTime(expiryTime);
            otpRepository.save(otp);
        } else {
            Otp otp = Otp.builder()
                    .email(email)
                    .otp(hashedOtp)
                    .expiryTime(expiryTime)
                    .build();
            otpRepository.save(otp);
        }

        emailService.sendOtpEmail(email, otpCode);
    }

    public boolean verifyOtp(String email, String rawOtp) {
        Otp storedOtp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No OTP found for this email"));

        if (storedOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        return passwordEncoder.matches(rawOtp, storedOtp.getOtp());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!verifyOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Optional: Invalidate OTP after successful reset
        Otp otp = otpRepository.findByEmail(request.getEmail()).orElseThrow();
        otpRepository.delete(otp);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
