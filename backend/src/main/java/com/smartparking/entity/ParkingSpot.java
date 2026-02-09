package com.smartparking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;

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
    @JoinColumn(name = "provider_id")
    private Provider provider;

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
    private Double weekendPricing;

    @Column(name = "is_covered")
    private boolean covered;

    @Column(name = "has_cctv")
    private boolean cctv;

    @Column(name = "has_guard")
    private boolean guard;

    @Column(name = "has_ev_charging")
    private boolean evCharging;

    // Vehicles Allowed
    @ElementCollection
    @CollectionTable(
            name = "parking_spot_vehicles",
            joinColumns = @JoinColumn(name = "parking_spot_id")
    )
    @Column(name = "vehicle_type")
    private Set<String> vehicleTypes;

    private String parkingType;
    private boolean monthlyPlan;

    // Images (URLs / paths only)
    @ElementCollection
    @CollectionTable(
            name = "parking_spot_images",
            joinColumns = @JoinColumn(name = "parking_spot_id")
    )
    @Column(name = "image_url")
    private List<String> imageUrls;

    // System-controlled
    @Enumerated(EnumType.STRING)
    private ParkingStatus status;

    public enum ParkingStatus {
        ACTIVE,
        MAINTENANCE,
        BLOCKED
    }
    public static ParkingSpot fromApplication(
            ProviderApplication application,
            Provider provider
    ) {
        if (application == null) {
            throw new IllegalArgumentException("ProviderApplication cannot be null");
        }

        ParkingSpot spot = new ParkingSpot();

        // Relation
        spot.setProvider(provider);

        // Basic details
        spot.setName(application.getName());
        spot.setDescription(application.getDescription());

        // Address
        spot.setState(application.getState());
        spot.setDistrict(application.getDistrict());
        spot.setAddress(application.getAddress());
        spot.setPincode(application.getPincode());
        spot.setGoogleMapsLink(application.getGoogleMapsLink());
        spot.setLatitude(application.getLatitude());
        spot.setLongitude(application.getLongitude());

        // Capacity & pricing
        spot.setTotalCapacity(application.getTotalCapacity());
        spot.setPricePerHour(application.getPricePerHour());
        spot.setWeekendPricing(application.getWeekendPricing());

        // Facilities
        spot.setCovered(application.isCovered());
        spot.setCctv(application.isCctv());
        spot.setGuard(application.isGuard());
        spot.setEvCharging(application.isEvCharging());

        // Configuration
        spot.setVehicleTypes(
                application.getVehicleTypes() != null
                        ? new HashSet<>(application.getVehicleTypes())
                        : new HashSet<>()
        );
        spot.setParkingType(application.getParkingType());
        spot.setMonthlyPlan(application.isMonthlyPlan());

        // Images
        spot.setImageUrls(
                application.getImageUrls() != null
                        ? new ArrayList<>(application.getImageUrls())
                        : new ArrayList<>()
        );

        // Initial status for newly created spot
        spot.setStatus(ParkingStatus.BLOCKED);

        return spot;
    }

}
