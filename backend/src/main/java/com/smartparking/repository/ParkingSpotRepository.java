package com.smartparking.repository;

import com.smartparking.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    List<ParkingSpot> findByOwnerId(Long ownerId);

    List<ParkingSpot> findByStateAndDistrict(String state, String district);
}
