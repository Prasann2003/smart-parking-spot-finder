package com.smartparking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
        private Integer totalCapacity; // Aggregate sum of all vehicle capacities
        private Double weekendSurcharge; // Global weekend surcharge
        private Double monthlyDiscountPercent; // Global monthly discount percentage

        @Column(name = "is_covered")
        private boolean covered;

        @Column(name = "has_cctv")
        private boolean cctv;

        @Column(name = "has_guard")
        private boolean guard;

        @Column(name = "has_ev_charging")
        private boolean evCharging;

        @CreationTimestamp
        private LocalDateTime createdAt;

        @UpdateTimestamp
        private LocalDateTime updatedAt;

        @Column(nullable = false)
        @Builder.Default
        private boolean isDeleted = false;

        // Ratings
        private Double averageRating = 0.0;
        private Integer totalReviews = 0;

        // Vehicles Allowed & Pricing - NEW RELATIONSHIP
        @Builder.Default
        @OneToMany(mappedBy = "parkingSpot", cascade = CascadeType.ALL, orphanRemoval = true)
        private Set<SpotVehicleConfig> vehicleConfigs = new HashSet<>();

        @Convert(converter = ParkingTypeConverter.class)
        private ParkingType parkingType;
        private boolean monthlyPlan;

        // Images (URLs / paths only)
        @ElementCollection
        @CollectionTable(name = "parking_spot_images", joinColumns = @JoinColumn(name = "parking_spot_id"))
        @Column(name = "image_url")
        private Set<String> imageUrls = new HashSet<>();

        // System-controlled
        @Enumerated(EnumType.STRING)
        private ParkingStatus status;

        public enum ParkingStatus {
                ACTIVE,
                MAINTENANCE,
                BLOCKED
        }

        // Helper to calculate total capacity
        public void calculateTotalCapacity() {
                if (this.vehicleConfigs != null) {
                        this.totalCapacity = this.vehicleConfigs.stream()
                                        .mapToInt(SpotVehicleConfig::getCapacity)
                                        .sum();
                }
        }

        public static ParkingSpot fromApplication(
                        ProviderApplication application,
                        Provider provider) {
                if (application == null) {
                        throw new IllegalArgumentException("ProviderApplication cannot be null");
                }

                ParkingSpot spot = new ParkingSpot();

                // Relation
                spot.setProvider(provider);

                // Basic details
                spot.setName(application.getParkingName());
                spot.setDescription(application.getDescription());

                // Address
                spot.setState(application.getState());
                spot.setDistrict(application.getDistrict());
                spot.setAddress(application.getAddress());
                spot.setPincode(application.getPincode());
                spot.setGoogleMapsLink(application.getGoogleMapsLink());
                spot.setLatitude(application.getLatitude());
                spot.setLongitude(application.getLongitude());

                if (application.getVehicleConfigs() != null) {
                        Set<SpotVehicleConfig> spotConfigs = application.getVehicleConfigs().stream()
                                        .map(appConfig -> SpotVehicleConfig.builder()
                                                        .vehicleType(appConfig.getVehicleType())
                                                        .capacity(appConfig.getCapacity())
                                                        .pricePerHour(appConfig.getPricePerHour())
                                                        .parkingSpot(spot)
                                                        .build())
                                        .collect(java.util.stream.Collectors.toSet());
                        spot.setVehicleConfigs(spotConfigs);
                        spot.calculateTotalCapacity();
                }

                spot.setWeekendSurcharge(application.getWeekendSurcharge());
                spot.setMonthlyDiscountPercent(application.getMonthlyDiscountPercent());

                // Facilities
                spot.setCovered(application.isCovered());
                spot.setCctv(application.isCctv());
                spot.setGuard(application.isGuard());
                spot.setEvCharging(application.isEvCharging());

                // Parking Type
                spot.setParkingType(application.getParkingType());
                spot.setMonthlyPlan(application.isMonthlyPlan());

                // Images
                spot.setImageUrls(
                                application.getImageUrls() != null
                                                ? new HashSet<>(application.getImageUrls())
                                                : new HashSet<>());

                // Initial status
                spot.setStatus(ParkingStatus.BLOCKED);

                return spot;
        }

}
