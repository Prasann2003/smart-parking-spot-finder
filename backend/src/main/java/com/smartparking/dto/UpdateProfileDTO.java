package com.smartparking.dto;

import lombok.Data;

@Data
public class UpdateProfileDTO {
    private String name;
    private String phone;
    private String address1;
    private String address2;
    private String state;
    private String district;
    private String pincode;
}
