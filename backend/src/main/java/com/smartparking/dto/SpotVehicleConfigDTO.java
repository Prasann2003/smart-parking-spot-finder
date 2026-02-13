package com.smartparking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpotVehicleConfigDTO {

    private Long id;

    @NotNull(message = "Vehicle type is required")
    private com.smartparking.entity.VehicleType vehicleType;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotNull(message = "Price per hour is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double pricePerHour;
}
