package com.smartparking.dto;

import com.smartparking.entity.ProviderApplication;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderApplicationDto {

    @NotBlank(message = "Name is required")
    private String name;

    private String ownerName;

    private String description;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private String googleMapsLink;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer totalCapacity;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double pricePerHour;

    private boolean covered;
    private boolean cctv;
    private boolean guard;
    private boolean evCharging;

    // New Fields
    @NotNull(message = "Vehicle types are required")
    private java.util.Set<String> vehicleTypes;

    @NotBlank(message = "Parking type is required")
    private String parkingType;

    private boolean monthlyPlan;
    private Double weekendPricing;

    @NotNull(message = "Parking area image is required")
    private MultipartFile parkingAreaImage;

    @NotNull(message = "Entry gate image is required")
    private MultipartFile entryGateImage;

    // Optional
    private MultipartFile surroundingAreaImage;

    // Provider Bank Details (Optional in DTO, can be updated in User profile)
    private String bankAccount;
    private String upiId;
    private String gstNumber;
    private String panNumber;

    private Double latitude;
    private Double longitude;

    private ProviderApplication.ApplicationStatus status;
    private Long ownerId;
    //private String ownerName;
    private String phoneNumber;
}
