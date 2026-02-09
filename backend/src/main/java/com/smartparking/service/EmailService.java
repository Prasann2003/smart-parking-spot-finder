package com.smartparking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Password Reset OTP");
            message.setText("Your OTP for password reset is: " + otp + "\nNormally this OTP is valid for 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to send OTP email. Please check your email configuration. Error: " + e.getMessage());
        }
    }
}
