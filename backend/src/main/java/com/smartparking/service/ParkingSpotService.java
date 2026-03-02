package com.smartparking.service;

import com.smartparking.dto.ParkingSpotDTO;
import com.smartparking.dto.ParkingSpotResponseDTO;
import com.smartparking.dto.UpdateParkingSpotDTO;
import com.smartparking.entity.ImageDirectoryType;
import com.smartparking.entity.ParkingSpot;
import com.smartparking.entity.Provider;
import com.smartparking.entity.User;
import com.smartparking.repository.*;
import com.smartparking.util.GoogleMapsUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
@lombok.extern.slf4j.Slf4j
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final ImageStorageService imageStorageService;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final RatingRepository ratingRepository;

    // addParkingSpot logic moved to ProviderService.addProviderWithSpot

    // addParkingSpot removed - moved to ProviderService

    public List<ParkingSpotResponseDTO> getParkingSpotsByOwner(Long providerId) {
        return parkingSpotRepository.findByProviderIdAndIsDeletedFalse(providerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ParkingSpot save(ParkingSpotDTO dto) {

        // 1️⃣ Get logged-in user
        String email = ((UserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal())
                .getUsername();

        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2️⃣ Get provider for user
        Provider provider = providerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Provider not found for user"));

        // 3️⃣ Save images
        List<String> imageUrls = new ArrayList<>();

        imageUrls.add(
                imageStorageService.saveFile(
                        dto.getParkingAreaImage(),
                        provider.getId(),
                        ImageDirectoryType.PARKING_SPOT));

        imageUrls.add(
                imageStorageService.saveFile(
                        dto.getGateImage(),
                        provider.getId(),
                        ImageDirectoryType.PARKING_SPOT));

        if (dto.getSurroundingImage() != null) {
            imageUrls.add(
                    imageStorageService.saveFile(
                            dto.getSurroundingImage(),
                            provider.getId(),
                            ImageDirectoryType.PARKING_SPOT));
        }

        // 4️⃣ Create ParkingSpot entity

        // Extract coordinates from Google Maps Link if available
        if (dto.getGoogleMapsLink() != null && !dto.getGoogleMapsLink().isEmpty()) {
            double[] coordinates = GoogleMapsUtil.getCoordinates(dto.getGoogleMapsLink());
            if (coordinates != null) {
                dto.setLatitude(coordinates[0]);
                dto.setLongitude(coordinates[1]);

            } else {
                log.warn("❌ Failed to extract coordinates from link: {}", dto.getGoogleMapsLink());
            }
        }

        ParkingSpot spot = new ParkingSpot();

        spot.setProvider(provider);
        spot.setName(dto.getName());
        spot.setDescription(dto.getDescription());

        // Address
        spot.setState(dto.getState());
        spot.setDistrict(dto.getDistrict());
        spot.setAddress(dto.getAddress());
        spot.setPincode(dto.getPincode());
        spot.setGoogleMapsLink(dto.getGoogleMapsLink());
        // Latitude and Longitude set above
        spot.setLatitude(dto.getLatitude());
        spot.setLongitude(dto.getLongitude());

        // Details
        // spot.setTotalCapacity(dto.getTotalCapacity()); // Calculated
        // spot.setPricePerHour(dto.getPricePerHour()); // Removed
        spot.setWeekendSurcharge(dto.getWeekendSurcharge());
        spot.setMonthlyDiscountPercent(dto.getMonthlyDiscountPercent());
        spot.setMonthlyPlan(dto.isMonthlyPlan());

        // Features
        spot.setCovered(dto.isCovered());
        spot.setCctv(dto.isCctv());
        spot.setGuard(dto.isGuard());
        spot.setEvCharging(dto.isEvCharging());

        // Config
        // spot.setVehicleTypes(dto.getVehicleTypes()); // Removed
        spot.setParkingType(dto.getParkingType());

        // Map Vehicle Configs
        if (dto.getVehicleConfigs() != null) {
            java.util.Set<com.smartparking.entity.SpotVehicleConfig> configs = new java.util.HashSet<>();
            for (com.smartparking.dto.SpotVehicleConfigDTO configDto : dto.getVehicleConfigs()) {
                com.smartparking.entity.SpotVehicleConfig config = com.smartparking.entity.SpotVehicleConfig.builder()
                        .vehicleType(configDto.getVehicleType())
                        .capacity(configDto.getCapacity())
                        .pricePerHour(configDto.getPricePerHour())
                        .parkingSpot(spot)
                        .build();
                configs.add(config);
            }
            spot.setVehicleConfigs(configs);
            spot.calculateTotalCapacity();
        }

        // Images
        spot.setImageUrls(new java.util.HashSet<>(imageUrls));

        // System-controlled fields
        spot.setStatus(ParkingSpot.ParkingStatus.ACTIVE);

        // 5️⃣ Save
        return parkingSpotRepository.save(spot);
    }

    public ParkingSpotResponseDTO getParkingSpotById(Long id) {
        ParkingSpot parkingSpot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking Spot not found"));
        return mapToDTO(parkingSpot);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking Spot not found"));

        try {
            ParkingSpot.ParkingStatus newStatus = ParkingSpot.ParkingStatus.valueOf(status);
            spot.setStatus(newStatus);
            parkingSpotRepository.save(spot);

            // If Deactivating (MAINTENANCE or BLOCKED), cancel future bookings
            if (newStatus != ParkingSpot.ParkingStatus.ACTIVE) {
                List<com.smartparking.entity.Booking> futureBookings = bookingRepository.findFutureConfirmedBookings(id,
                        java.time.LocalDateTime.now());

                for (com.smartparking.entity.Booking booking : futureBookings) {
                    // 1. Cancel Booking
                    booking.setStatus(com.smartparking.entity.Booking.BookingStatus.CANCELLED);

                    // 2. Refund Payment
                    if (booking.getPayment() != null) {
                        booking.getPayment().setStatus(com.smartparking.entity.Payment.PaymentStatus.REFUNDED);
                    }
                    bookingRepository.save(booking);

                    // 3. Notify User
                    String message = "Your booking for " + spot.getName() + " on " +
                            booking.getStartTime().toLocalDate() +
                            " has been cancelled because the parking spot is now unavailable. Use a different spot.";

                    com.smartparking.entity.Notification notification = com.smartparking.entity.Notification.builder()
                            .user(booking.getUser())
                            .title("Booking Cancelled ⚠️")
                            .message(message)
                            .type("danger")
                            .isRead(false)
                            .createdAt(java.time.LocalDateTime.now())
                            .build();

                    notificationRepository.save(notification);
                }
            }

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }

    @Transactional
    public ParkingSpotResponseDTO updateParkingSpot(Long id, UpdateParkingSpotDTO dto) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking Spot not found"));

        // Update basic details
        spot.setName(dto.getName());
        spot.setDescription(dto.getDescription());
        // spot.setPricePerHour(dto.getPricePerHour()); // Removed
        // spot.setTotalCapacity(dto.getTotalCapacity()); // Calculated
        spot.setWeekendSurcharge(dto.getWeekendSurcharge());
        spot.setMonthlyDiscountPercent(dto.getMonthlyDiscountPercent());
        spot.setMonthlyPlan(dto.isMonthlyPlan());
        spot.setParkingType(dto.getParkingType());

        // Update Location Details
        spot.setAddress(dto.getAddress());
        spot.setState(dto.getState());
        spot.setDistrict(dto.getDistrict());
        spot.setPincode(dto.getPincode());
        spot.setGoogleMapsLink(dto.getGoogleMapsLink());

        // Only update lat/long if provided explicitly, otherwise keep existing or rely
        // on link logic if implemented
        // Only update lat/long if provided explicitly, otherwise try to extract from
        // link
        // 1. Try to extract from Google Maps Link FIRST
        boolean coordinatesUpdatedFromLink = false;
        if (dto.getGoogleMapsLink() != null && !dto.getGoogleMapsLink().isEmpty()) {
            double[] coordinates = GoogleMapsUtil.getCoordinates(dto.getGoogleMapsLink());
            if (coordinates != null) {
                spot.setLatitude(coordinates[0]);
                spot.setLongitude(coordinates[1]);
                coordinatesUpdatedFromLink = true;

            }
        }

        // 2. If link didn't provide coords, allow manual override from DTO
        if (!coordinatesUpdatedFromLink) {
            if (dto.getLatitude() != null && dto.getLatitude() != 0) {
                spot.setLatitude(dto.getLatitude());
            }
            if (dto.getLongitude() != null && dto.getLongitude() != 0) {
                spot.setLongitude(dto.getLongitude());
            }
        }

        // Update features
        spot.setCovered(dto.isCovered());
        spot.setCctv(dto.isCctv());
        spot.setGuard(dto.isGuard());
        spot.setEvCharging(dto.isEvCharging());

        // Update vehicle types if provided
        if (dto.getVehicleConfigs() != null && !dto.getVehicleConfigs().isEmpty()) {
            // Clear existing configs (Orphan removal handles deletion)
            spot.getVehicleConfigs().clear();

            // Add new configs
            for (com.smartparking.dto.SpotVehicleConfigDTO configDto : dto.getVehicleConfigs()) {
                com.smartparking.entity.SpotVehicleConfig config = com.smartparking.entity.SpotVehicleConfig.builder()
                        .vehicleType(configDto.getVehicleType())
                        .capacity(configDto.getCapacity())
                        .pricePerHour(configDto.getPricePerHour())
                        .parkingSpot(spot)
                        .build();
                spot.getVehicleConfigs().add(config);
            }
            spot.calculateTotalCapacity();
        }

        ParkingSpot updatedSpot = parkingSpotRepository.save(spot);
        return mapToDTO(updatedSpot);
    }

    public Page<ParkingSpotResponseDTO> getNearbyParkingSpots(double userLat, double userLng, double radiusKm,
            Boolean cctv, Boolean covered, Boolean evCharging, Boolean guard,
            Pageable pageable) {
        Page<ParkingSpot> nearbySpotsPage = parkingSpotRepository.findNearbySpots(userLat, userLng, radiusKm, cctv,
                covered, evCharging, guard, pageable);

        return nearbySpotsPage.map(this::mapToDTO);
    }

    public long getNearbySpotsCount(double userLat, double userLng, double radiusKm) {
        return parkingSpotRepository.countNearbySpots(userLat, userLng, radiusKm);
    }

    public List<ParkingSpotResponseDTO> getAllParkingSpots() {
        return parkingSpotRepository.findByStatusAndIsDeletedFalse(ParkingSpot.ParkingStatus.ACTIVE).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Page<ParkingSpotResponseDTO> searchParkingSpots(String state, String district,
            Boolean cctv, Boolean covered, Boolean evCharging, Boolean guard,
            Pageable pageable) {
        return parkingSpotRepository
                .findByStateAndDistrictAndStatus(state, district, ParkingSpot.ParkingStatus.ACTIVE, cctv, covered,
                        evCharging, guard, pageable)
                .map(this::mapToDTO);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of Earth in kilometers

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public ParkingSpotResponseDTO mapToDTO(ParkingSpot parkingSpot) {

        // --- SELF-HEALING FOR LEGACY DATA ---
        // If rating is 0 but reviews might exist in DB, verify and sync.
        if (parkingSpot.getTotalReviews() == null || parkingSpot.getTotalReviews() == 0) {
            Long realCount = ratingRepository.countByParkingSpotId(parkingSpot.getId());
            if (realCount > 0) {
                Double realAvg = ratingRepository.getAverageRating(parkingSpot.getId());
                // Round to 1 decimal
                realAvg = Math.round(realAvg * 10.0) / 10.0;

                parkingSpot.setTotalReviews(realCount.intValue());
                parkingSpot.setAverageRating(realAvg);

                // Persist the correction so we don't query again
                parkingSpotRepository.save(parkingSpot);
                log.info("✅ Self-healed rating for spot {}: {}", parkingSpot.getId(), realAvg);
            }
        }
        // ------------------------------------

        java.util.List<String> images = new java.util.ArrayList<>();
        try {
            if (parkingSpot.getImageUrls() != null) {
                // Sanitize image URLs
                for (String url : parkingSpot.getImageUrls()) {
                    if (url.startsWith("D:\\Infosys\\upload")) {
                        String relative = url.substring("D:\\Infosys\\upload".length());
                        images.add("/uploads" + relative.replace("\\", "/"));
                    } else if (url.startsWith("/api/images")) {
                        images.add(url);
                    } else if (!url.startsWith("/uploads") && !url.startsWith("http")) {
                        images.add("/uploads/" + url);
                    } else {
                        images.add(url);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("some error while adding the images");
        }

        Long ownerId = null;
        String ownerName = "Unknown";
        String phoneNumber = "N/A";

        try {
            if (parkingSpot.getProvider() != null && parkingSpot.getProvider().getUser() != null) {
                User u = parkingSpot.getProvider().getUser();
                ownerId = u.getId();
                ownerName = u.getName();
                phoneNumber = u.getPhoneNumber();
            }
        } catch (Exception e) {
        }

        return ParkingSpotResponseDTO.builder()
                .id(parkingSpot.getId())
                .name(parkingSpot.getName())
                .description(parkingSpot.getDescription())
                .state(parkingSpot.getState())
                .district(parkingSpot.getDistrict())
                .address(parkingSpot.getAddress())
                .pincode(parkingSpot.getPincode())
                .googleMapsLink(parkingSpot.getGoogleMapsLink())
                .latitude(parkingSpot.getLatitude())
                .longitude(parkingSpot.getLongitude())
                .totalCapacity(parkingSpot.getTotalCapacity())
                .longitude(parkingSpot.getLongitude())
                .totalCapacity(parkingSpot.getTotalCapacity())
                // .pricePerHour(parkingSpot.getPricePerHour()) // Removed from entity, use
                // config or min?
                // Let's return the lowest price for display or create a helper?
                // For DTO compatibility, if frontend expects a single price, we might need a
                // placeholder or update frontend.
                // Updating frontend to use vehicleConfigs list.
                .pricePerHour(parkingSpot.getVehicleConfigs().stream()
                        .mapToDouble(com.smartparking.entity.SpotVehicleConfig::getPricePerHour)
                        .min().orElse(0.0)) // Return min price for display listing
                .covered(parkingSpot.isCovered())
                .cctv(parkingSpot.isCctv())
                .guard(parkingSpot.isGuard())
                .evCharging(parkingSpot.isEvCharging())

                // Map Configs
                .vehicleConfigs(parkingSpot.getVehicleConfigs().stream()
                        .map(c -> com.smartparking.dto.SpotVehicleConfigDTO.builder()
                                .id(c.getId())
                                .vehicleType(c.getVehicleType())
                                .capacity(c.getCapacity())
                                .pricePerHour(c.getPricePerHour())
                                .build())
                        .collect(Collectors.toList()))

                // .vehicleTypes(vehicles) // Removed
                .parkingType(parkingSpot.getParkingType())
                .monthlyPlan(parkingSpot.isMonthlyPlan())
                .weekendSurcharge(parkingSpot.getWeekendSurcharge())
                .monthlyDiscountPercent(parkingSpot.getMonthlyDiscountPercent())
                .imageUrls(images)
                .status(parkingSpot.getStatus() != null ? parkingSpot.getStatus() : ParkingSpot.ParkingStatus.BLOCKED)
                .averageRating(parkingSpot.getAverageRating() != null ? parkingSpot.getAverageRating() : 0.0)
                .totalReviews(parkingSpot.getTotalReviews() != null ? parkingSpot.getTotalReviews() : 0)
                .ownerId(ownerId)
                .ownerName(ownerName)
                .phoneNumber(phoneNumber)
                .availableSlots(parkingSpot.getTotalCapacity() != null
                        ? Math.max(0, parkingSpot.getTotalCapacity() - (int) bookingRepository
                                .countCurrentBookingsForSpot(parkingSpot.getId(), java.time.LocalDateTime.now()))
                        : 0)
                .build();
    }

}
