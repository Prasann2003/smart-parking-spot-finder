package com.smartparking.service;

import com.smartparking.dto.ParkingProviderApplicationDto;
import com.smartparking.util.GoogleMapsUtil;
import com.smartparking.entity.*;
import com.smartparking.repository.ParkingProviderApplicationRepository;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.ProviderRepository;
import com.smartparking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProviderService {

        private final UserRepository userRepository;
        private final ProviderRepository providerRepository;
        private final ParkingSpotRepository parkingSpotRepository;
        private final ImageStorageService imageStorageService;
        private final ParkingProviderApplicationRepository parkingProviderApplicationRepository;

        // public void addProviderWithSpot(ParkingProviderApplicationDTO dto) {
        // String email = ((UserDetails)
        // SecurityContextHolder.getContext().getAuthentication().getPrincipal())
        // .getUsername();
        // User user = userRepository.findByEmail(email)
        // .orElseThrow(() -> new RuntimeException("User not found"));
        //
        // // 1. Create or Update Provider
        // Provider provider = providerRepository.findByUser(user)
        // .orElse(Provider.builder()
        // .user(user)
        // .fullName(dto.getOwnerName() != null ? dto.getOwnerName() : user.getName())
        // .verificationStatus(Provider.VerificationStatus.PENDING)
        // .build());
        //
        // // Update details
        // if (dto.getOwnerName() != null)
        // provider.setFullName(dto.getOwnerName());
        // provider.setGovernmentId(dto.getGstNumber()); // Mapping DTO fields to
        // Provider specific fields if needed
        // provider.setPanNumber(dto.getPanNumber());
        // provider.setGstNumber(dto.getGstNumber());
        // provider.setBankAccountNumber(dto.getBankAccount());
        // provider.setUpiId(dto.getUpiId());
        //
        // // Ensure status is pending for new additions if needed, or keep existing
        // if (provider.getVerificationStatus() == null) {
        // provider.setVerificationStatus(Provider.VerificationStatus.PENDING);
        // }
        //
        // provider = providerRepository.save(provider);
        //
        // // 2. Create Parking Spot linked to Provider
        // //// ParkingSpot spot = ParkingSpot.builder()
        // //// .provider(provider)
        // //// .name(dto.getName())
        // //// .description(dto.getDescription())
        // //// .state(dto.getState())
        // //// .district(dto.getDistrict())
        // //// .address(dto.getAddress())
        // //// .pincode(dto.getPincode())
        // //// .googleMapsLink(dto.getGoogleMapsLink())
        // //// .latitude(dto.getLatitude())
        // //// .longitude(dto.getLongitude())
        // //// .totalCapacity(dto.getTotalCapacity())
        // //// .pricePerHour(dto.getPricePerHour())
        // //// .covered(dto.isCovered())
        // //// .cctv(dto.isCctv())
        // //// .guard(dto.isGuard())
        // //// .evCharging(dto.isEvCharging())
        // //// .vehicleTypes(dto.getVehicleTypes())
        // //// .parkingType(dto.getParkingType())
        // //// .monthlyPlan(dto.isMonthlyPlan())
        // //// .weekendPricing(dto.getWeekendPricing())
        // //// .imageUrls(dto.getImageUrls())
        // // // Verify logic: If provider is already approved, spot is active? Or spots
        // // need
        // // // individual approval?
        // // // For now, let's assume if Provider is PENDING, everything is pending.
        // // // If Provider is APPROVED, maybe spot is APPROVED (ACTIVE)?
        // //// .status(provider.getVerificationStatus() ==
        // // Provider.VerificationStatus.APPROVED
        // //// ? ParkingSpot.ParkingStatus.ACTIVE
        // //// : ParkingSpot.ParkingStatus.BLOCKED)
        // // // Using BLOCKED as "Pending" equivalent for Spot if needed, or maybe add
        // // // PENDING back to Spot?
        // // // User's ParkingSpot definition had 'status'. Let's stick to existing
        // enums
        // // or
        // // // user's requested 'created_at'.
        // // // Existing: ACTIVE, MAINTENANCE, BLOCKED.
        // // // If Provider is Pending, spot shouldn't be visible. BLOCKED or generic
        // // // "INACTIVE".
        // //// .build();
        // //
        // // // Wait, user's ParkingSpot definition included 'status'.
        // // // My previous clean up left: ACTIVE, MAINTENANCE, BLOCKED.
        // // // It's better if Spot has 'PENDING' if it needs approval?
        // // // User said: "Provider... verificationStatus" and "ParkingSpot...
        // status".
        // // // Let's assume if Provider is PENDING, Spot is not queryable.
        // //
        // // parkingSpotRepository.save(spot);
        // // }
        public ProviderApplication saveApplication(
                        ParkingProviderApplicationDto dto) {

                String email = ((UserDetails) SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getPrincipal())
                                .getUsername();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<String> imageUrls = new ArrayList<>();

                // Save required images
                imageUrls.add(
                                imageStorageService.saveFile(
                                                dto.getParkingAreaImage(),
                                                user.getId(),
                                                ImageDirectoryType.APPLICATION));

                imageUrls.add(
                                imageStorageService.saveFile(
                                                dto.getEntryGateImage(),
                                                user.getId(),
                                                ImageDirectoryType.APPLICATION));

                // Optional image
                if (dto.getSurroundingAreaImage() != null) {
                        imageUrls.add(
                                        imageStorageService.saveFile(
                                                        dto.getSurroundingAreaImage(),
                                                        user.getId(),
                                                        ImageDirectoryType.APPLICATION));
                }

                // Extract coordinates from Google Maps Link if available
                if (dto.getGoogleMapsLink() != null && !dto.getGoogleMapsLink().isEmpty()) {
                        double[] coordinates = GoogleMapsUtil.getCoordinates(dto.getGoogleMapsLink());
                        if (coordinates != null) {
                                dto.setLatitude(coordinates[0]);
                                dto.setLongitude(coordinates[1]);
                        }
                }

                ProviderApplication application = ProviderApplication.builder()
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
                                .vehicleTypes(dto.getVehicleTypes())
                                .parkingType(dto.getParkingType())
                                .monthlyPlan(dto.isMonthlyPlan())
                                .weekendPricing(dto.getWeekendPricing())
                                .bankAccount(dto.getBankAccount())
                                .upiId(dto.getUpiId())
                                .gstNumber(dto.getGstNumber())
                                .panNumber(dto.getPanNumber())
                                .latitude(dto.getLatitude())
                                .longitude(dto.getLongitude())
                                .ownerId(user.getId())
                                .ownerName(dto.getOwnerName() != null
                                                ? dto.getOwnerName()
                                                : user.getName())
                                .phoneNumber(dto.getPhoneNumber())
                                .status(ProviderApplication.ApplicationStatus.PENDING)
                                .imageUrls(imageUrls)
                                .user(user)
                                .build();

                return parkingProviderApplicationRepository.save(application);
        }

        public String getProviderStatus(String email) {
                User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
                Optional<ProviderApplication> app = parkingProviderApplicationRepository.findByUser(user);
                return app.map(providerApplication -> providerApplication.getStatus().name()).orElse("NONE");
                // Optional<Provider> provider = providerRepository.findByUser(user);
                // if (provider.isEmpty())
                // return "NONE";
                // return provider.get().getVerificationStatus().name();
        }
}
