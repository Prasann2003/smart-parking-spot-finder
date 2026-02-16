package com.smartparking.dto;

import com.smartparking.entity.ParkingSpot;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Builder
public class ParkingSpotResponseDTO {
    // ===== Identity =====
    private Long id;
    private String name;
    private String description;

    private String ownerName;
    private String phoneNumber;
    private long ownerId;

    // ===== Location =====
    private String state;
    private String district;
    private String address;
    private String pincode;
    private String googleMapsLink;
    private Double latitude;
    private Double longitude;

    // ===== Parking Features =====
    private List<SpotVehicleConfigDTO> vehicleConfigs;
    private Integer totalCapacity;
    private Integer availableSlots;
    private Double pricePerHour;

    private Double weekendSurcharge;
    private Double monthlyDiscountPercent;
    private boolean monthlyPlan;

    private boolean covered;
    private boolean cctv;
    private boolean guard;
    private boolean evCharging;

    private String parkingType;

    // ===== Ratings =====
    private Double averageRating;
    private Integer totalReviews;

    // ===== Images =====
    private List<String> imageUrls;

    // ===== System Fields =====
    private ParkingSpot.ParkingStatus status;
}
