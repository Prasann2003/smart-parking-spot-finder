package com.smartparking.service;

import com.smartparking.dto.ParkingSpotDTO;
import com.smartparking.entity.ParkingSpot;
import com.smartparking.entity.User;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;
    private final com.smartparking.repository.ProviderApplicationRepository providerApplicationRepository;

    public ParkingSpotDTO addParkingSpot(ParkingSpotDTO dto) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update Owner Details if provided
        if (dto.getBankAccount() != null)
            owner.setBankAccount(dto.getBankAccount());
        if (dto.getUpiId() != null)
            owner.setUpiId(dto.getUpiId());
        if (dto.getGstNumber() != null)
            owner.setGstNumber(dto.getGstNumber());
        if (dto.getPanNumber() != null)
            owner.setPanNumber(dto.getPanNumber());
        userRepository.save(owner);

        // Determine Status based on Role
        boolean isProvider = owner.getRole() == com.smartparking.entity.Role.PROVIDER;
        ParkingSpot.ParkingStatus spotStatus = isProvider ? ParkingSpot.ParkingStatus.APPROVED
                : ParkingSpot.ParkingStatus.PENDING;

        ParkingSpot parkingSpot = ParkingSpot.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .state(dto.getState())
                .district(dto.getDistrict())
                .address(dto.getAddress())
                .pincode(dto.getPincode())
                .googleMapsLink(dto.getGoogleMapsLink())
                .totalCapacity(dto.getTotalCapacity())
                .pricePerHour(dto.getPricePerHour())
                .covered(dto.isCovered())
                .cctv(dto.isCctv())
                .guard(dto.isGuard())
                .evCharging(dto.isEvCharging())
                // New Fields
                .vehicleTypes(dto.getVehicleTypes())
                .parkingType(dto.getParkingType())
                .monthlyPlan(dto.isMonthlyPlan())
                .weekendPricing(dto.getWeekendPricing())
                .imageUrls(dto.getImageUrls())
                .status(spotStatus)
                .owner(owner)
                .build();

        ParkingSpot savedSpot = parkingSpotRepository.save(parkingSpot);

        // If NOT a provider, create a ProviderApplication
        if (!isProvider) {
            com.smartparking.entity.ProviderApplication application = com.smartparking.entity.ProviderApplication
                    .builder()
                    .user(owner)
                    .parkingSpot(savedSpot)
                    .status(com.smartparking.entity.ProviderApplication.ApplicationStatus.PENDING)
                    .build();
            providerApplicationRepository.save(application);
        }

        return mapToDTO(savedSpot);
    }

    public List<ParkingSpotDTO> getNearbyParkingSpots(double userLat, double userLng, double radiusKm) {
        List<ParkingSpot> allSpots = parkingSpotRepository.findByStatus(ParkingSpot.ParkingStatus.APPROVED);
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

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public List<ParkingSpotDTO> getAllParkingSpots() {
        return parkingSpotRepository.findByStatus(ParkingSpot.ParkingStatus.APPROVED).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ParkingSpotDTO> searchParkingSpots(String state, String district) {
        return parkingSpotRepository
                .findByStateAndDistrictAndStatus(state, district, ParkingSpot.ParkingStatus.APPROVED).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Admin Methods
    public List<ParkingSpotDTO> getPendingParkingSpots() {
        return parkingSpotRepository.findByStatus(ParkingSpot.ParkingStatus.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void updateSpotStatus(Long id, String status) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spot not found"));

        ParkingSpot.ParkingStatus newStatus = ParkingSpot.ParkingStatus.valueOf(status);
        spot.setStatus(newStatus);

        if (newStatus == ParkingSpot.ParkingStatus.APPROVED) {
            User owner = spot.getOwner();
            if (owner.getRole() != com.smartparking.entity.Role.PROVIDER) {
                owner.setRole(com.smartparking.entity.Role.PROVIDER);
                userRepository.save(owner);
            }
        }

        parkingSpotRepository.save(spot);
    }

    public List<ParkingSpotDTO> getParkingSpotsByOwner(Long ownerId) {
        return parkingSpotRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ParkingSpotDTO getParkingSpotById(Long id) {
        ParkingSpot parkingSpot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking Spot not found"));
        return mapToDTO(parkingSpot);
    }

    private ParkingSpotDTO mapToDTO(ParkingSpot parkingSpot) {
        java.util.Set<String> vehicles = new java.util.HashSet<>();
        try {
            if (parkingSpot.getVehicleTypes() != null) {
                vehicles.addAll(parkingSpot.getVehicleTypes());
            }
        } catch (Exception e) {
            // Ignore lazy loading or data error
        }

        java.util.List<String> images = new java.util.ArrayList<>();
        try {
            if (parkingSpot.getImageUrls() != null) {
                images.addAll(parkingSpot.getImageUrls());
            }
        } catch (Exception e) {
            // Ignore
        }

        Long ownerId = null;
        String ownerName = "Unknown";
        String phoneNumber = "N/A";

        try {
            User owner = parkingSpot.getOwner();
            if (owner != null) {
                ownerId = owner.getId();
                ownerName = owner.getName();
                phoneNumber = owner.getPhoneNumber();
            }
        } catch (Exception e) {
            // Ignore bad owner reference
        }

        return ParkingSpotDTO.builder()
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
                //
                .status(parkingSpot.getStatus() != null ? parkingSpot.getStatus().name() : "PENDING")
                .ownerId(ownerId)
                .ownerName(ownerName)
                .phoneNumber(phoneNumber)
                .build();
    }
}
