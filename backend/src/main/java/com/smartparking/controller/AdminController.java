package com.smartparking.controller;

import com.smartparking.service.ParkingSpotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final com.smartparking.repository.UserRepository userRepository;
    private final com.smartparking.repository.BookingRepository bookingRepository;
    private final com.smartparking.repository.ParkingSpotRepository parkingSpotRepository;
    private final com.smartparking.repository.ProviderApplicationRepository providerApplicationRepository;
    private final ParkingSpotService parkingSpotService;

    @GetMapping("/provider-applications")
    public ResponseEntity<List<com.smartparking.entity.ProviderApplication>> getPendingApplications() {
        return ResponseEntity.ok(providerApplicationRepository
                .findByStatus(com.smartparking.entity.ProviderApplication.ApplicationStatus.PENDING));
    }

    @PostMapping("/provider/{id}/{action}")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id, @PathVariable String action) {
        // action: "approve" or "reject"
        com.smartparking.entity.ProviderApplication application = providerApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        com.smartparking.entity.ProviderApplication.ApplicationStatus newStatus = action.equalsIgnoreCase("approve")
                ? com.smartparking.entity.ProviderApplication.ApplicationStatus.APPROVED
                : com.smartparking.entity.ProviderApplication.ApplicationStatus.REJECTED;

        application.setStatus(newStatus);
        application.setDecisionDate(java.time.LocalDateTime.now());

        providerApplicationRepository.save(application);

        // If Approved, also approve the Parking Spot and User Role
        if (newStatus == com.smartparking.entity.ProviderApplication.ApplicationStatus.APPROVED) {
            parkingSpotService.updateSpotStatus(application.getParkingSpot().getId(), "APPROVED");
        } else if (newStatus == com.smartparking.entity.ProviderApplication.ApplicationStatus.REJECTED) {
            parkingSpotService.updateSpotStatus(application.getParkingSpot().getId(), "REJECTED");
        }

        return ResponseEntity.ok(Map.of("message", "Application " + action + "d successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        long totalUsers = userRepository.countByRole(com.smartparking.entity.Role.USER);
        long totalProviders = userRepository.countByRole(com.smartparking.entity.Role.PROVIDER);
        long totalSpots = parkingSpotRepository.count();
        long activeBookings = bookingRepository.count(); // Simplified: total bookings
        long cancelledBookings = 0; // tracking cancelled not implemented yet
        Double revenue = bookingRepository.calculateTotalRevenue();

        // System Alerts based on pending applications
        long pendingApps = providerApplicationRepository
                .findByStatus(com.smartparking.entity.ProviderApplication.ApplicationStatus.PENDING).size();
        List<String> alerts = new java.util.ArrayList<>();
        if (pendingApps > 0)
            alerts.add(pendingApps + " pending provider applications");

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalProviders", totalProviders,
                "totalSpots", totalSpots,
                "activeBookings", activeBookings,
                "cancelledBookings", cancelledBookings,
                "totalRevenue", revenue != null ? revenue : 0.0,
                "systemAlerts", alerts));
    }
}
