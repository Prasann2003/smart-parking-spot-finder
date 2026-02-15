package com.smartparking.controller;

import com.smartparking.entity.User;
import com.smartparking.exception.NotFoundException;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ParkingSpotRepository parkingSpotRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final com.smartparking.service.SavedSpotService savedSpotService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            Authentication auth) {
        User user = getUser(auth);
        Map<String, Object> stats = new HashMap<>();
        stats.put("nearbySpots", parkingSpotRepository.count()); // simplified
        stats.put("activeBookings", bookingRepository.countActiveBookings(user,
                LocalDateTime.now())); // simplified
        stats.put("favorites", savedSpotService.countSavedSpots(user));
        return ResponseEntity.ok(stats);
    }

    private User getUser(Authentication authentication) {
        User loggedUser = (User) authentication.getPrincipal();
        return userRepository.findByEmail(loggedUser.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<Object>> getActivity() {
        return ResponseEntity.ok(new ArrayList<>()); // return empty list for now
    }
}
