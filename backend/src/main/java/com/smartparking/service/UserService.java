package com.smartparking.service;

import com.smartparking.dto.UpdateProfileDTO;
import com.smartparking.entity.User;
import com.smartparking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final com.smartparking.repository.RatingRepository ratingRepository;
    private final com.smartparking.repository.SavedSpotRepository savedSpotRepository;
    private final com.smartparking.repository.ProviderRepository providerRepository;
    private final com.smartparking.repository.ParkingSpotRepository parkingSpotRepository;
    private final com.smartparking.repository.ParkingProviderApplicationRepository providerApplicationRepository;
    private final BookingService bookingService;

    public User updateProfile(String email, UpdateProfileDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getName() != null && !dto.getName().isEmpty())
            user.setName(dto.getName());
        if (dto.getPhone() != null && !dto.getPhone().isEmpty())
            user.setPhoneNumber(dto.getPhone());
        if (dto.getAddress1() != null)
            user.setAddress1(dto.getAddress1());
        if (dto.getAddress2() != null)
            user.setAddress2(dto.getAddress2());
        if (dto.getState() != null)
            user.setState(dto.getState());
        if (dto.getDistrict() != null)
            user.setDistrict(dto.getDistrict());
        if (dto.getPincode() != null)
            user.setPincode(dto.getPincode());
        if (dto.getVehicleType() != null)
            user.setVehicleType(dto.getVehicleType());

        return userRepository.save(user);
    }

    public com.smartparking.dto.UserProfileDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return com.smartparking.dto.UserProfileDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .address1(user.getAddress1())
                .address2(user.getAddress2())
                .state(user.getState())
                .district(user.getDistrict())
                .pincode(user.getPincode())
                .vehicleType(user.getVehicleType())
                .build();
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == com.smartparking.entity.Role.ADMIN) {
            throw new RuntimeException("Admins cannot delete their account");
        }

        // 1. Cancel and Unlink User Bookings
        bookingService.cancelAndUnlinkUserBookings(user.getId());

        // 2. Delete User Ratings & Favorites
        ratingRepository.deleteByUserId(user.getId());
        savedSpotRepository.deleteByUserId(user.getId());

        // 3. If Provider, cascading delete
        if (user.getRole() == com.smartparking.entity.Role.PROVIDER) {
            providerRepository.findByUser(user).ifPresent(provider -> {
                // For each spot
                parkingSpotRepository.findByProviderId(provider.getId()).forEach(spot -> {
                    bookingService.cancelAndUnlinkSpotBookings(spot.getId());
                    ratingRepository.deleteByParkingSpotId(spot.getId());
                    savedSpotRepository.deleteByParkingSpotId(spot.getId());
                    parkingSpotRepository.delete(spot);
                });
                providerRepository.delete(provider);
            });

            providerApplicationRepository.deleteByUserId(user.getId());
        }

        // 4. Delete User
        userRepository.delete(user);
    }
}
