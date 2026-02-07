package com.smartparking.controller;

import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.ParkingSpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("nearbySpots", parkingSpotRepository.count()); // simplified
        stats.put("activeBookings", bookingRepository.count()); // simplified
        stats.put("favorites", 0);
        stats.put("moneySaved", 0);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/activity")
    public ResponseEntity<List<Object>> getActivity() {
        return ResponseEntity.ok(new ArrayList<>()); // return empty list for now
    }
}
