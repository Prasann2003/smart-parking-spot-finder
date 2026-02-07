package com.smartparking.controller;

import com.smartparking.dto.BookingDTO;
import com.smartparking.dto.ParkingSpotDTO;
import com.smartparking.entity.User;
import com.smartparking.repository.UserRepository;
import com.smartparking.service.BookingService;
import com.smartparking.service.ParkingSpotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class ProviderController {

    private final ParkingSpotService parkingSpotService;
    private final BookingService bookingService;
    private final UserRepository userRepository;

    @GetMapping("/parkings")
    public ResponseEntity<List<ParkingSpotDTO>> getMyParkingSpots(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(parkingSpotService.getParkingSpotsByOwner(user.getId()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getMySpotBookings(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingService.getBookingsByOwner(user.getId()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ParkingSpotDTO> spots = parkingSpotService.getParkingSpotsByOwner(user.getId());
        List<BookingDTO> bookings = bookingService.getBookingsByOwner(user.getId());

        double todayEarnings = 0; // consistent with frontend placeholder
        double monthlyEarnings = calculateTotalEarnings(bookings);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalParkings", spots.size());
        stats.put("activeBookings", bookings.stream().filter(b -> "TV".equals(b.getStatus())).count()); // TODO: Fix
                                                                                                        // status check
        stats.put("todayEarnings", todayEarnings);
        stats.put("monthlyEarnings", monthlyEarnings);

        return ResponseEntity.ok(stats);
    }

    private double calculateTotalEarnings(List<BookingDTO> bookings) {
        return bookings.stream().mapToDouble(BookingDTO::getTotalPrice).sum();
    }
}
