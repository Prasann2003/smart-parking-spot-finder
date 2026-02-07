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

import com.smartparking.entity.ProviderApplication;
import com.smartparking.entity.Role;
import com.smartparking.repository.ProviderApplicationRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Optional;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class ProviderController {

    private final ParkingSpotService parkingSpotService;
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final ProviderApplicationRepository providerApplicationRepository;

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
        stats.put("activeBookings", bookings.stream().filter(b -> "CONFIRMED".equals(b.getStatus())).count());
        stats.put("todayEarnings", todayEarnings);
        stats.put("monthlyEarnings", monthlyEarnings);

        return ResponseEntity.ok(stats);
    }

    private double calculateTotalEarnings(List<BookingDTO> bookings) {
        return bookings.stream().mapToDouble(BookingDTO::getTotalPrice).sum();
    }

    @GetMapping("/application-status")
    public ResponseEntity<Map<String, String>> getApplicationStatus() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.PROVIDER) {
            return ResponseEntity.ok(Map.of("status", "APPROVED"));
        }

        // Check for existing application
        Optional<ProviderApplication> application = providerApplicationRepository.findByUserAndStatus(user,
                ProviderApplication.ApplicationStatus.PENDING);

        if (application.isPresent()) {
            return ResponseEntity.ok(Map.of("status", "PENDING"));
        }

        // Also check if rejected
        Optional<ProviderApplication> rejectedApp = providerApplicationRepository.findByUserAndStatus(user,
                ProviderApplication.ApplicationStatus.REJECTED);

        if (rejectedApp.isPresent()) {
            return ResponseEntity.ok(Map.of("status", "REJECTED"));
        }

        return ResponseEntity.ok(Map.of("status", "NONE"));
    }
}
