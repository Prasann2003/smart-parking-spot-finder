package com.smartparking.repository;

import com.smartparking.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    List<ParkingSpot> findByProviderId(Long providerId);

    List<ParkingSpot> findByStateAndDistrict(String state, String district);

    List<ParkingSpot> findByStatus(com.smartparking.entity.ParkingSpot.ParkingStatus status);

    List<ParkingSpot> findByStateAndDistrictAndStatus(String state, String district,
            com.smartparking.entity.ParkingSpot.ParkingStatus status);
}
