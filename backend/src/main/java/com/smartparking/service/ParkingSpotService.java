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
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;

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
                .status(ParkingSpot.ParkingStatus.PENDING)
                .owner(owner)
                .build();

        ParkingSpot saved = parkingSpotRepository.save(parkingSpot);
        return mapToDTO(saved);
    }

    public List<ParkingSpotDTO> getNearbyParkingSpots(double userLat, double userLng, double radiusKm) {
        List<ParkingSpot> allSpots = parkingSpotRepository.findAll();
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
        return parkingSpotRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ParkingSpotDTO> searchParkingSpots(String state, String district) {
        return parkingSpotRepository.findByStateAndDistrict(state, district).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
                // New Fields
                .vehicleTypes(parkingSpot.getVehicleTypes())
                .parkingType(parkingSpot.getParkingType())
                .monthlyPlan(parkingSpot.isMonthlyPlan())
                .weekendPricing(parkingSpot.getWeekendPricing())
                .imageUrls(parkingSpot.getImageUrls())
                //
                .status(parkingSpot.getStatus().name())
                .ownerId(parkingSpot.getOwner().getId())
                .build();
    }
}
