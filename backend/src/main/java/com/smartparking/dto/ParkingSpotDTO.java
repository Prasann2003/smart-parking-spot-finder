package com.smartparking.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.Set;
import com.smartparking.entity.ParkingType;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSpotDTO {
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

    @NotNull(message = "Vehicle configurations are required")
    @Size(min = 1, message = "Add at least one vehicle configuration")
    private java.util.List<SpotVehicleConfigDTO> vehicleConfigs;

    private Integer totalCapacity; // Calculated/Aggregate

    // private Double pricePerHour; // REMOVED - now in config
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private Double weekendSurcharge;
    private Double monthlyDiscountPercent;

    private boolean monthlyPlan;

    private boolean covered;
    private boolean cctv;
    private boolean guard;
    private boolean evCharging;

    @NotNull(message = "Parking type is required")
    private ParkingType parkingType;

    private Double latitude;
    private Double longitude;
    // ===== Images =====

    @NotNull(message = "Parking area image is required")
    private MultipartFile parkingAreaImage;

    @NotNull(message = "Entry gate image is required")
    private MultipartFile gateImage;

    // Optional
    private MultipartFile surroundingImage;

    // ===== Optional Metadata =====
    private String description;
}
