package com.smartparking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "spot_vehicle_configs")
public class SpotVehicleConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private Double pricePerHour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_spot_id")
    @JsonIgnore
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    private ParkingSpot parkingSpot;
}
