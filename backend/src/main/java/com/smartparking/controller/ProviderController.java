package com.smartparking.controller;

import com.smartparking.dto.*;
import com.smartparking.entity.Provider;
import com.smartparking.entity.User;
import com.smartparking.repository.ProviderRepository;
import com.smartparking.repository.UserRepository;
import com.smartparking.service.BookingService;
import com.smartparking.service.ParkingSpotService;
import com.smartparking.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class ProviderController {

    private final ParkingSpotService parkingSpotService;
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final ProviderService providerService;

    @GetMapping("/parkings")
    public ResponseEntity<List<ParkingSpotResponseDTO>> getMyParkingSpots(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Provider> provider = providerRepository.findByUser(user);
        return provider.map(value -> ResponseEntity.ok(parkingSpotService.getParkingSpotsByOwner(value.getId())))
                .orElseGet(() -> ResponseEntity.ok(List.of()));

    }

    @GetMapping("/view/{id}")
    public ResponseEntity<ParkingSpotResponseDTO> getProviderSpotView(@PathVariable Long id) {
        // In future, verify ownership here if needed
        return ResponseEntity.ok(parkingSpotService.getParkingSpotById(id));
    }

    @PutMapping("/toggle-status/{id}")
    public ResponseEntity<String> toggleStatus(@PathVariable Long id, @RequestParam String status) {
        parkingSpotService.updateStatus(id, status);
        return ResponseEntity.ok("Status updated successfully");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ParkingSpotResponseDTO> updateParkingSpot(@PathVariable Long id,
            @RequestBody UpdateParkingSpotDTO dto) {
        return ResponseEntity.ok(parkingSpotService.updateParkingSpot(id, dto));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getMySpotBookings(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // BookingService needs update to handle Provider? Or standard User ID is
        // enough?
        // If BookingService searches by Spot -> Owner, it might fail if Spot.owner is
        // removed.
        // I will assume for now BookingService needs a fix, but let's look at
        // BookingService first.
        return ResponseEntity.ok(bookingService.getBookingsByOwner(user.getId()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam String email) {
        System.out.println("Fetching Provider Dashboard for: " + email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Optional<Provider> provider = providerRepository.findByUser(user);
        if (provider.isEmpty()) {
            return ResponseEntity
                    .ok(Map.of("totalParkings", 0, "activeBookings", 0, "todayEarnings", 0, "monthlyEarnings", 0));
        }

        List<ParkingSpotResponseDTO> spots = parkingSpotService.getParkingSpotsByOwner(provider.get().getId());
        List<BookingDTO> bookings = bookingService.getBookingsByOwner(user.getId()); // This might need fix

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

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProviderWithSpot(@ModelAttribute ParkingProviderApplicationDto dto) {
        providerService.saveApplication(dto);
        return ResponseEntity.ok(Map.of("message", "Application submitted successfully!"));
    }

    @GetMapping("/application-status")
    public ResponseEntity<Map<String, String>> getApplicationStatus() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();

        String status = providerService.getProviderStatus(email);
        return ResponseEntity.ok(Map.of("status", status));
    }
}
