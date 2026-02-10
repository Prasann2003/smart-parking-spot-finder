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
                .build();
    }
}
