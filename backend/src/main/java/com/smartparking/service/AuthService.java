package com.smartparking.service;

import com.smartparking.dto.AuthRequest;
import com.smartparking.dto.AuthResponse;
import com.smartparking.dto.RegisterRequest;
import com.smartparking.entity.Role;
import com.smartparking.entity.User;
import com.smartparking.repository.UserRepository;
import com.smartparking.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .build();

        userRepository.save(user);

        var token = jwtTokenProvider.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        System.out.println("Attempting login for: " + request.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            System.out.println("Authentication failed for " + request.getEmail() + ": " + e.getMessage());
            throw e;
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("User found: " + user.getEmail() + ", Role: " + user.getRole());

        var token = jwtTokenProvider.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public void changePassword(String email, com.smartparking.dto.ChangePasswordDTO request) {
        System.out.println("Processing change password for: " + email);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            System.out.println("Password Mismatch! provided: " + request.getOldPassword() + " vs stored hash");
            throw new RuntimeException("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        System.out.println("Password updated successfully for: " + email);
    }
}
