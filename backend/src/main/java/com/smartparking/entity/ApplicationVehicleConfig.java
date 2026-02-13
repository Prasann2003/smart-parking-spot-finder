package com.smartparking.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ApplicationVehicleConfig {
    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;
    private Integer capacity;
    private Double pricePerHour;
}
