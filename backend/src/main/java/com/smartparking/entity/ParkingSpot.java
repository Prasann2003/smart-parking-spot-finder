package com.smartparking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "parking_spots")
public class ParkingSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User owner;

    private String name;
    private String description;

    // Address
    private String state;
    private String district;
    private String address;
    private String pincode;
    private String googleMapsLink;
    private Double latitude;
    private Double longitude;

    // Details
    private Integer totalCapacity;
    private Double pricePerHour;

    @Column(name = "is_covered")
    private boolean covered;

    @Column(name = "has_cctv")
    private boolean cctv;

    @Column(name = "has_guard")
    private boolean guard;

    @Column(name = "has_ev_charging")
    private boolean evCharging;

    // New Fields matching Frontend
    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "parking_spot_vehicles", joinColumns = @JoinColumn(name = "parking_spot_id"))
    @Column(name = "vehicle_type")
    private java.util.Set<String> vehicleTypes = new java.util.HashSet<>();

    private String parkingType; // "Covered" or "Open"
    private boolean monthlyPlan;
    private Double weekendPricing;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "parking_spot_images", joinColumns = @JoinColumn(name = "parking_spot_id"))
    @Column(name = "image_url")
    private java.util.List<String> imageUrls = new java.util.ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ParkingStatus status;

    public enum ParkingStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
