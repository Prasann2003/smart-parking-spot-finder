package com.smartparking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "provider_applications")
public class ProviderApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user")
    private User user;
    // Basic Details
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String pincode;

    private String googleMapsLink;

    // Capacity & Pricing
    @Column(nullable = false)
    private Integer totalCapacity;

    @Column(nullable = false)
    private Double pricePerHour;

    private Double weekendPricing;

    // Facilities
    private boolean covered;
    private boolean cctv;
    private boolean guard;
    private boolean evCharging;

    // Parking Configuration
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "parking_vehicle_types", joinColumns = @JoinColumn(name = "parking_application_id"))
    @Column(name = "vehicle_type")
    private Set<String> vehicleTypes;

    @Column(nullable = false)
    private String parkingType;

    private boolean monthlyPlan;

    // Images
    @ElementCollection
    @CollectionTable(name = "parking_images", joinColumns = @JoinColumn(name = "parking_application_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    // Bank & Compliance Details
    private String bankAccount;
    private String upiId;
    private String gstNumber;
    private String panNumber;

    // Location
    private Double latitude;
    private Double longitude;

    // Application Status
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status; // PENDING, APPROVED, REJECTED

    @Column(length = 1000)
    private String rejectionReason;

    private java.time.LocalDateTime rejectionDate;

    // Owner Info
    private Long ownerId;
    private String ownerName;
    private String phoneNumber;

    public enum ApplicationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
