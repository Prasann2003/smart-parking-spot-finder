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

import java.time.LocalDate;
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
@lombok.extern.slf4j.Slf4j
public class ProviderController {

    private final ParkingSpotService parkingSpotService;
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final ProviderService providerService;

    @GetMapping("/parkings")
    public ResponseEntity<List<ParkingSpotResponseDTO>> getMyParkingSpots(@RequestParam String email) {
        String loggedInEmail = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        if (!email.equals(loggedInEmail)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Provider> provider = providerRepository.findByUser(user);
        if (provider.isPresent()) {
            List<ParkingSpotResponseDTO> spots = parkingSpotService.getParkingSpotsByOwner(provider.get().getId());
            return ResponseEntity.ok(spots);
        } else {
            return ResponseEntity.ok(List.of());
        }

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
        String loggedInEmail = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        if (!email.equals(loggedInEmail)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingService.getBookingsByOwner(user.getId()));
    }

    @GetMapping("/bookings-paginated")
    public ResponseEntity<org.springframework.data.domain.Page<BookingDTO>> getMySpotBookingsPaginated(
            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long spotId,
            @RequestParam(required = false) String status) {

        String loggedInEmail = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        if (!email.equals(loggedInEmail)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Provider> provider = providerRepository.findByUser(user);
        if (provider.isEmpty()) {
            return ResponseEntity.ok(org.springframework.data.domain.Page.empty());
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by("startTime").descending());

        return ResponseEntity.ok(bookingService.getProviderBookings(pageable, provider.get().getId(), spotId, status));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam String email) {
        String loggedInEmail = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        if (!email.equals(loggedInEmail)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Optional<Provider> provider = providerRepository.findByUser(user);
        if (provider.isEmpty()) {

            return ResponseEntity
                    .ok(Map.of("totalParkings", 0, "activeBookings", 0, "todayEarnings", 0, "monthlyEarnings", 0));
        }

        List<ParkingSpotResponseDTO> spots = parkingSpotService.getParkingSpotsByOwner(provider.get().getId());

        List<BookingDTO> bookings = bookingService.getBookingsByOwner(user.getId());

        double todayEarnings = calculateTodayEarnings(bookings);
        double monthlyEarnings = calculateTotalEarnings(bookings);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalParkings", spots.size());
        stats.put("activeBookings", bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "ACTIVE".equals(b.getStatus())).count());
        stats.put("todayEarnings", todayEarnings);
        stats.put("monthlyEarnings", monthlyEarnings);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<List<com.smartparking.dto.MonthlyRevenueDTO>> getProviderMonthlyRevenue(
            @RequestParam String email) {
        String loggedInEmail = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        if (!email.equals(loggedInEmail)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Optional<Provider> provider = providerRepository.findByUser(user);
        if (provider.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(providerService.getProviderMonthlyRevenue(email));
    }

    private double calculateTotalEarnings(List<BookingDTO> bookings) {
        return bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "ACTIVE".equals(b.getStatus())
                        || "COMPLETED".equals(b.getStatus()))
                .mapToDouble(b -> {
                    Double earnings = b.getProviderEarnings();
                    if (earnings == null) {
                        earnings = b.getTotalPrice();
                    }
                    return earnings != null ? earnings : 0.0;
                })
                .sum();
    }

    private double calculateTodayEarnings(List<BookingDTO> bookings) {

        LocalDate today = LocalDate.now();

        return bookings.stream()
                .filter(booking -> booking.getCreatedAt() != null)
                .filter(booking -> booking.getCreatedAt().toLocalDate().equals(today))
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "ACTIVE".equals(b.getStatus())
                        || "COMPLETED".equals(b.getStatus()))
                .mapToDouble(b -> {
                    Double earnings = b.getProviderEarnings();
                    if (earnings == null) {
                        earnings = b.getTotalPrice();
                    }
                    return earnings != null ? earnings : 0.0;
                })
                .sum();
    }

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProviderWithSpot(
            @ModelAttribute @jakarta.validation.Valid ParkingProviderApplicationDto dto,
            org.springframework.validation.BindingResult result) {
        if (result.hasErrors()) {
            java.util.List<String> errors = result.getAllErrors().stream()
                    .map(e -> e.getDefaultMessage())
                    .collect(java.util.stream.Collectors.toList());

            log.debug("Validation Errors: {}", errors);
            result.getAllErrors().forEach(error -> {
                log.debug("Field: {} - {}", ((org.springframework.validation.FieldError) error).getField(),
                        error.getDefaultMessage());
            });

            return ResponseEntity.badRequest().body(Map.of("message", "Validation Failed", "errors", errors));
        }
        providerService.saveApplication(dto);
        return ResponseEntity.ok(Map.of("message", "Application submitted successfully!"));
    }

    @GetMapping("/application-status")
    public ResponseEntity<Map<String, String>> getApplicationStatus() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();

        java.util.Map<String, String> statusMap = providerService.getProviderStatus(email);
        return ResponseEntity.ok(statusMap);
    }
}
