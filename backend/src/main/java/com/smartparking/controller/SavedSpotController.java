package com.smartparking.controller;

import com.smartparking.dto.ParkingSpotResponseDTO;
import com.smartparking.entity.User;
import com.smartparking.service.SavedSpotService;
import com.smartparking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/saved-spots")
@RequiredArgsConstructor
public class SavedSpotController {

    private final SavedSpotService savedSpotService;

    // In Spring Security, @AuthenticationPrincipal User user injects the
    // authenticated user
    // Make sure User details service returns your User entity or cast safely.
    // If your Principal is different, adjust accordingly. Assuming User implements
    // UserDetails.

    @PostMapping("/toggle/{spotId}")
    public ResponseEntity<Map<String, Object>> toggleSavedSpot(
            @PathVariable Long spotId,
            @AuthenticationPrincipal User user) {
        boolean isSaved = savedSpotService.toggleSavedSpot(spotId, user);
        return ResponseEntity.ok(Map.of("saved", isSaved));
    }

    @GetMapping
    public ResponseEntity<List<ParkingSpotResponseDTO>> getSavedSpots(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(savedSpotService.getSavedSpots(user));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getSavedSpotIds(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(savedSpotService.getSavedSpotIds(user));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countSavedSpots(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", savedSpotService.countSavedSpots(user)));
    }
}
