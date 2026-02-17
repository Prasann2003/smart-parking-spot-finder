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

        @org.springframework.data.jpa.repository.Query("SELECT p FROM ParkingSpot p WHERE " +
                        "(6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) * " +
                        "cos(radians(p.longitude) - radians(:userLng)) + " +
                        "sin(radians(:userLat)) * sin(radians(p.latitude)))) <= :radius")
        List<ParkingSpot> findNearbySpots(@org.springframework.data.repository.query.Param("userLat") double userLat,
                        @org.springframework.data.repository.query.Param("userLng") double userLng,
                        @org.springframework.data.repository.query.Param("radius") double radius);

        @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
        @org.springframework.data.jpa.repository.Query("SELECT p FROM ParkingSpot p WHERE p.id = :id")
        java.util.Optional<ParkingSpot> findByIdWithLock(
                        @org.springframework.data.repository.query.Param("id") Long id);
}
