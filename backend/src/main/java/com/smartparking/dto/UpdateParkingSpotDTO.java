package com.smartparking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateParkingSpotDTO {
    // ===== Location Details =====

    @NotBlank(message = "Parking name is required")
    private String name;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Full address is required")
    private String address;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private String googleMapsLink;

    // ===== Parking Features =====

    @NotNull(message = "Vehicle types are required")
    @Size(min = 1, message = "Select at least one vehicle type")
    private Set<String> vehicleTypes; // Car, Bike, Bus, EV

    @NotNull(message = "Total capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer totalCapacity;

    @NotNull(message = "Price per hour is required")
    @Min(value = 0, message = "Price per hour cannot be negative")
    private Double pricePerHour;

    private Double weekendPricing;

    private boolean monthlyPlan;

    private boolean covered;
    private boolean cctv;
    private boolean guard;
    private boolean evCharging;

    @NotBlank(message = "Parking type is required")
    private String parkingType;

    private Double latitude;
    private Double longitude;

    // ===== Optional Metadata =====
    private String description;
}
