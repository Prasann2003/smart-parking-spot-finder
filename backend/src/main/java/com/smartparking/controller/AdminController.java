package com.smartparking.controller;

import com.smartparking.exception.NotFoundException;
import com.smartparking.entity.*;
import com.smartparking.repository.ParkingProviderApplicationRepository;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.ProviderRepository;
import com.smartparking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class AdminController {

    private final UserRepository userRepository;
    private final com.smartparking.repository.BookingRepository bookingRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final ProviderRepository providerRepository;
    private final ParkingProviderApplicationRepository parkingProviderApplicationRepository;

    @GetMapping("/provider-applications")
    public ResponseEntity<List<Map<String, Object>>> getPendingApplications() {
        List<ProviderApplication> applications = parkingProviderApplicationRepository
                .findByStatus(ProviderApplication.ApplicationStatus.PENDING);

        List<Map<String, Object>> response = applications.stream().map(app -> {

            Map<String, Object> map = new HashMap<>();

            map.put("id", app.getId());
            map.put("status", app.getStatus());
            map.put("name", app.getName());
            map.put("submissionDate", "N/A"); // or app.getCreatedAt() later

            // user block (mapped from application fields)
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", app.getOwnerId());
            userMap.put("email", null); // not stored in application
            userMap.put("phoneNumber", app.getPhoneNumber());
            userMap.put("name", app.getName());

            map.put("user", userMap);

            // parkingSpot block (mapped from application)
            Map<String, Object> spotMap = new HashMap<>();
            spotMap.put("name", app.getName());
            spotMap.put("address", app.getAddress());
            spotMap.put("totalCapacity", app.getTotalCapacity());

            map.put("parkingSpot", spotMap);

            return map;

        }).toList();

        return ResponseEntity.ok(response);

    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Map<String, Object>> getApplicationById(@PathVariable Long id) {
        ProviderApplication app = parkingProviderApplicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application not found"));

        Map<String, Object> map = new HashMap<>();
        map.put("id", app.getId());
        map.put("status", app.getStatus());
        map.put("name", app.getName());
        map.put("submissionDate", "N/A"); // or app.getCreatedAt() later

        // user block
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", app.getOwnerId());
        userMap.put("email", null);
        userMap.put("phoneNumber", app.getPhoneNumber());
        userMap.put("name", app.getName());
        map.put("user", userMap);

        // parkingSpot block
        Map<String, Object> spotMap = new HashMap<>();
        spotMap.put("name", app.getName());
        spotMap.put("address", app.getAddress());
        spotMap.put("totalCapacity", app.getTotalCapacity());
        map.put("parkingSpot", spotMap);

        // Add other details needed for detailed view
        map.put("address", app.getAddress());
        map.put("latitude", app.getLatitude());
        map.put("longitude", app.getLongitude());
        map.put("totalCapacity", app.getTotalCapacity());
        map.put("pricePerHour", app.getPricePerHour());
        map.put("description", app.getDescription());

        // Amenities
        map.put("cctv", app.isCctv());
        map.put("covered", app.isCovered());
        map.put("guard", app.isGuard());
        map.put("evCharging", app.isEvCharging());
        map.put("vehicleTypes", app.getVehicleTypes());
        map.put("parkingType", app.getParkingType());
        map.put("monthlyPlan", app.isMonthlyPlan());
        map.put("weekendPricing", app.getWeekendPricing());

        // Bank (Admin only)
        map.put("bankAccount", app.getBankAccount());
        map.put("upiId", app.getUpiId());
        map.put("gstNumber", app.getGstNumber());
        map.put("panNumber", app.getPanNumber());
        // Sanitize image URLs for frontend
        List<String> sanitizedImages = app.getImageUrls().stream()
                .map(url -> {
                    if (url.startsWith("D:\\Infosys\\upload")) {
                        // Convert absolute path to web path
                        String relative = url.substring("D:\\Infosys\\upload".length());
                        return "/uploads" + relative.replace("\\", "/");
                    } else if (url.startsWith("/api/images")) {
                        return url; // Keep existing API style if present
                    } else if (!url.startsWith("/uploads") && !url.startsWith("http")) {
                        // Assume it's a relative path from uploads root if not absolute
                        return "/uploads/" + url;
                    }
                    return url;
                })
                .collect(java.util.stream.Collectors.toList());

        map.put("imageUrls", sanitizedImages);

        return ResponseEntity.ok(map);
    }

    @PostMapping("/provider/{id}/{action}")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @PathVariable String action,
            @RequestBody(required = false) Map<String, String> payload) {

        ProviderApplication application = parkingProviderApplicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application not found"));

        if (application.getStatus() != ProviderApplication.ApplicationStatus.PENDING) {
            throw new RuntimeException("Application has already been processed");
        }

        if (action.equalsIgnoreCase("approve")) {

            // 1️⃣ Mark application approved
            application.setStatus(ProviderApplication.ApplicationStatus.APPROVED);
            parkingProviderApplicationRepository.save(application);

            // 2️⃣ Upgrade user role
            User user = application.getUser();
            if (user.getRole() != Role.PROVIDER) {
                user.setRole(Role.PROVIDER);
                userRepository.save(user);
            }
            Provider provider = Provider.fromApplication(application);
            provider = providerRepository.save(provider);

            ParkingSpot spot = ParkingSpot.fromApplication(application, provider);
            spot.setStatus(ParkingSpot.ParkingStatus.ACTIVE);
            parkingSpotRepository.save(spot);

            return ResponseEntity.ok(
                    Map.of("message", "Application approved successfully"));

        } else if (action.equalsIgnoreCase("reject")) {

            String reason = (payload != null) ? payload.get("reason") : "No reason provided";
            application.setRejectionReason(reason);
            application.setRejectionDate(java.time.LocalDateTime.now());
            application.setStatus(ProviderApplication.ApplicationStatus.REJECTED);
            parkingProviderApplicationRepository.save(application);

            return ResponseEntity.ok(
                    Map.of("message", "Application rejected successfully"));
        }

        throw new IllegalArgumentException("Invalid action: " + action);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        System.out.println("Fetching Admin Stats...");
        long totalUsers = userRepository.countByRole(com.smartparking.entity.Role.USER);
        long totalProviders = userRepository.countByRole(com.smartparking.entity.Role.PROVIDER);
        long totalSpots = parkingSpotRepository.count();
        long activeBookings = bookingRepository
                .countByStatus(com.smartparking.entity.Booking.BookingStatus.CONFIRMED);
        long cancelledBookings = bookingRepository
                .countByStatus(com.smartparking.entity.Booking.BookingStatus.CANCELLED);

        Double revenue = bookingRepository.calculateTotalRevenue();

        long pendingApps = providerRepository
                .findByVerificationStatus(Provider.VerificationStatus.PENDING).size();
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
