package com.smartparking.controller;

import com.smartparking.dto.UpdateProfileDTO;
import com.smartparking.entity.User;
import com.smartparking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<com.smartparking.dto.UserProfileDTO> getProfile(Principal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(Principal principal, @RequestBody UpdateProfileDTO dto) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), dto));
    }
}
