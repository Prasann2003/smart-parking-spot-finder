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
@lombok.extern.slf4j.Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final com.smartparking.repository.BookingRepository bookingRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final ProviderRepository providerRepository;
    private final ParkingProviderApplicationRepository parkingProviderApplicationRepository;
    private final org.springframework.boot.actuate.health.HealthEndpoint healthEndpoint;

    @GetMapping("/provider-applications-paginated")
    public ResponseEntity<org.springframework.data.domain.Page<Map<String, Object>>> getApplicationsPaginated(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        org.springframework.data.domain.Page<ProviderApplication> appPage;

        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                ProviderApplication.ApplicationStatus appStatus = ProviderApplication.ApplicationStatus
                        .valueOf(status.toUpperCase());
                appPage = parkingProviderApplicationRepository.findByStatus(appStatus, pageable);
            } catch (IllegalArgumentException e) {
                // Fallback to all if invalid status
                appPage = parkingProviderApplicationRepository.findAll(pageable);
            }
        } else {
            appPage = parkingProviderApplicationRepository.findAll(pageable);
        }

        org.springframework.data.domain.Page<Map<String, Object>> responsePage = appPage
                .map(this::mapApplicationToResponse);
        return ResponseEntity.ok(responsePage);
    }

    private Map<String, Object> mapApplicationToResponse(ProviderApplication app) {
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
        spotMap.put("pricePerHour", app.getPricePerHour());
        spotMap.put("vehicleConfigs", app.getVehicleConfigs());
        spotMap.put("parkingType", app.getParkingType());

        // Sanitize image URLs for frontend items
        if (app.getImageUrls() != null) {
            List<String> sanitizedImages = app.getImageUrls().stream()
                    .map(url -> {
                        if (url.startsWith("D:\\Infosys\\upload")) {
                            String relative = url.substring("D:\\Infosys\\upload".length());
                            return "/uploads" + relative.replace("\\", "/");
                        } else if (url.startsWith("/api/images")) {
                            return url;
                        } else if (!url.startsWith("/uploads") && !url.startsWith("http")) {
                            return "/uploads/" + url;
                        }
                        return url;
                    })
                    .collect(java.util.stream.Collectors.toList());
            spotMap.put("imageUrls", sanitizedImages);
        } else {
            spotMap.put("imageUrls", java.util.Collections.emptyList());
        }

        map.put("parkingSpot", spotMap);

        return map;
    }

    @GetMapping("/provider-applications")
    public ResponseEntity<List<Map<String, Object>>> getPendingApplications() {
        List<ProviderApplication> applications = parkingProviderApplicationRepository
                .findByStatus(ProviderApplication.ApplicationStatus.PENDING);

        List<Map<String, Object>> response = applications.stream().map(this::mapApplicationToResponse).toList();

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
        spotMap.put("name", app.getParkingName());
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
        map.put("vehicleConfigs", app.getVehicleConfigs());
        map.put("parkingType", app.getParkingType());
        map.put("monthlyPlan", app.isMonthlyPlan());
        map.put("weekendSurcharge", app.getWeekendSurcharge());
        map.put("monthlyDiscountPercent", app.getMonthlyDiscountPercent());

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
        log.info("Fetching Admin Stats...");
        long totalUsers = userRepository.countByRoleAndIsDeletedFalse(com.smartparking.entity.Role.USER);
        long totalProviders = userRepository.countByRoleAndIsDeletedFalse(com.smartparking.entity.Role.PROVIDER);
        long totalSpots = parkingSpotRepository.count();
        long activeBookings = bookingRepository
                .countByStatusIn(java.util.Arrays.asList(
                        com.smartparking.entity.Booking.BookingStatus.CONFIRMED,
                        com.smartparking.entity.Booking.BookingStatus.ACTIVE));
        long cancelledBookings = bookingRepository
                .countByStatus(com.smartparking.entity.Booking.BookingStatus.CANCELLED);

        Double totalRevenue = bookingRepository.calculateTotalRevenue();
        Double platformEarnings = bookingRepository.calculateTotalPlatformEarnings();

        long pendingApps = providerRepository
                .countByVerificationStatus(Provider.VerificationStatus.PENDING);
        List<String> alerts = new java.util.ArrayList<>();
        if (pendingApps > 0)
            alerts.add(pendingApps + " pending provider applications");

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalProviders", totalProviders,
                "totalSpots", totalSpots,
                "activeBookings", activeBookings,
                "cancelledBookings", cancelledBookings,
                "totalRevenue", totalRevenue != null ? totalRevenue : 0.0,
                "platformEarnings", platformEarnings != null ? platformEarnings : 0.0,
                "systemAlerts", alerts));
    }

    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        try {
            org.springframework.boot.actuate.health.HealthComponent health = healthEndpoint.health();
            Map<String, Object> response = new HashMap<>();

            String overallStatus = health.getStatus().getCode();
            response.put("status", overallStatus);

            if (health instanceof org.springframework.boot.actuate.health.CompositeHealth) {
                org.springframework.boot.actuate.health.CompositeHealth compositeHealth = (org.springframework.boot.actuate.health.CompositeHealth) health;

                Map<String, String> components = new HashMap<>();
                compositeHealth.getComponents().forEach((name, component) -> {
                    components.put(name, component.getStatus().getCode());
                });
                response.put("components", components);
            }

            if ("DOWN".equals(overallStatus) || "OUT_OF_SERVICE".equals(overallStatus)) {
                return ResponseEntity.status(503).body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch system health", e);
            return ResponseEntity.status(503).body(Map.of("status", "DOWN", "error", "Health check unavailable"));
        }
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.smartparking.repository.PaymentRepository paymentRepository;

    @GetMapping("/revenue-chart")
    public ResponseEntity<List<com.smartparking.dto.MonthlyRevenueDTO>> getMonthlyRevenue() {
        return ResponseEntity.ok(paymentRepository.getMonthlyRevenue());
    }

    @GetMapping("/users")
    public ResponseEntity<org.springframework.data.domain.Page<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());

        org.springframework.data.domain.Page<User> userPage;

        if (role != null && !role.isEmpty() && !role.equalsIgnoreCase("ALL")) {
            userPage = userRepository.findByRoleAndIsDeletedFalse(Role.valueOf(role.toUpperCase()), pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        org.springframework.data.domain.Page<Map<String, Object>> responsePage = userPage.map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("name", user.getName());
            map.put("email", user.getEmail());
            map.put("phoneNumber", user.getPhoneNumber());
            map.put("role", user.getRole().name());
            map.put("createdAt", user.getCreatedAt());
            return map;
        });

        return ResponseEntity.ok(responsePage);
    }
}
