package com.smartparking.dto;

import com.smartparking.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phoneNumber;
    private String address1;
    private String address2;
    private String state;
    private String district;
    private String pincode;
}
