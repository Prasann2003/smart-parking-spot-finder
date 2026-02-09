package com.smartparking.service;

import com.smartparking.dto.ParkingSpotDTO;
import com.smartparking.util.GoogleMapsUtil;
import com.smartparking.dto.ParkingSpotResponseDTO;
import com.smartparking.entity.ImageDirectoryType;
import com.smartparking.entity.ParkingSpot;
import com.smartparking.entity.Provider;
import com.smartparking.entity.User;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.ProviderRepository;
import com.smartparking.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final ImageStorageService imageStorageService;

    // addParkingSpot logic moved to ProviderService.addProviderWithSpot

    // addParkingSpot removed - moved to ProviderService

    public List<ParkingSpotResponseDTO> getParkingSpotsByOwner(Long providerId) {
        return parkingSpotRepository.findByProviderId(providerId).stream()
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

        User user = userRepository.findByEmail(email)
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
        spot.setLatitude(dto.getLatitude());
        spot.setLongitude(dto.getLongitude());

        // Details
        spot.setTotalCapacity(dto.getTotalCapacity());
        spot.setPricePerHour(dto.getPricePerHour());
        spot.setWeekendPricing(dto.getWeekendPricing());
        spot.setMonthlyPlan(dto.isMonthlyPlan());

        // Features
        spot.setCovered(dto.isCovered());
        spot.setCctv(dto.isCctv());
        spot.setGuard(dto.isGuard());
        spot.setEvCharging(dto.isEvCharging());

        // Config
        spot.setVehicleTypes(dto.getVehicleTypes());
        spot.setParkingType(dto.getParkingType());

        // Images
        spot.setImageUrls(imageUrls);

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

    public List<ParkingSpotResponseDTO> getNearbyParkingSpots(double userLat, double userLng, double radiusKm) {
        List<ParkingSpot> allSpots = parkingSpotRepository.findByStatus(ParkingSpot.ParkingStatus.ACTIVE);
        return allSpots.stream()
                .filter(spot -> {
                    if (spot.getLatitude() == null || spot.getLongitude() == null)
                        return false;
                    double distance = calculateDistance(userLat, userLng, spot.getLatitude(), spot.getLongitude());
                    return distance <= radiusKm;
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ParkingSpotResponseDTO> getAllParkingSpots() {
        return parkingSpotRepository.findByStatus(ParkingSpot.ParkingStatus.ACTIVE).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ParkingSpotResponseDTO> searchParkingSpots(String state, String district) {
        return parkingSpotRepository
                .findByStateAndDistrictAndStatus(state, district, ParkingSpot.ParkingStatus.ACTIVE).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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

    private ParkingSpotResponseDTO mapToDTO(ParkingSpot parkingSpot) {
        java.util.Set<String> vehicles = new java.util.HashSet<>();
        try {
            if (parkingSpot.getVehicleTypes() != null) {
                vehicles.addAll(parkingSpot.getVehicleTypes());
            }
        } catch (Exception e) {
            throw new RuntimeException("some error while adding the vehicles");
        }

        java.util.List<String> images = new java.util.ArrayList<>();
        try {
            if (parkingSpot.getImageUrls() != null) {
                images.addAll(parkingSpot.getImageUrls());
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
                .pricePerHour(parkingSpot.getPricePerHour())
                .covered(parkingSpot.isCovered())
                .cctv(parkingSpot.isCctv())
                .guard(parkingSpot.isGuard())
                .evCharging(parkingSpot.isEvCharging())
                .vehicleTypes(vehicles)
                .parkingType(parkingSpot.getParkingType())
                .monthlyPlan(parkingSpot.isMonthlyPlan())
                .weekendPricing(parkingSpot.getWeekendPricing())
                .imageUrls(images)
                .status(parkingSpot.getStatus() != null ? parkingSpot.getStatus() : ParkingSpot.ParkingStatus.BLOCKED)
                .ownerId(ownerId)
                .ownerName(ownerName)
                .phoneNumber(phoneNumber)
                .build();
    }

}
