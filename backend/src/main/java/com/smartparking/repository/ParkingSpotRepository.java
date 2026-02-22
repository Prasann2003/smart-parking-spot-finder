package com.smartparking.repository;

import com.smartparking.entity.ParkingSpot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
        List<ParkingSpot> findByProviderId(Long providerId);

        List<ParkingSpot> findByStateAndDistrict(String state, String district);

        List<ParkingSpot> findByStatus(com.smartparking.entity.ParkingSpot.ParkingStatus status);

        @org.springframework.data.jpa.repository.Query("SELECT p FROM ParkingSpot p WHERE " +
                        "p.state = :state AND p.district = :district AND p.status = :status " +
                        "AND (:cctv IS NULL OR p.cctv = :cctv) " +
                        "AND (:covered IS NULL OR p.covered = :covered) " +
                        "AND (:evCharging IS NULL OR p.evCharging = :evCharging) " +
                        "AND (:guard IS NULL OR p.guard = :guard)")
        Page<ParkingSpot> findByStateAndDistrictAndStatus(
                        @org.springframework.data.repository.query.Param("state") String state,
                        @org.springframework.data.repository.query.Param("district") String district,
                        @org.springframework.data.repository.query.Param("status") com.smartparking.entity.ParkingSpot.ParkingStatus status,
                        @org.springframework.data.repository.query.Param("cctv") Boolean cctv,
                        @org.springframework.data.repository.query.Param("covered") Boolean covered,
                        @org.springframework.data.repository.query.Param("evCharging") Boolean evCharging,
                        @org.springframework.data.repository.query.Param("guard") Boolean guard,
                        Pageable pageable);

        @org.springframework.data.jpa.repository.Query(value = "SELECT p FROM ParkingSpot p WHERE p.status = 'ACTIVE' AND "
                        +
                        "(6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) * " +
                        "cos(radians(p.longitude) - radians(:userLng)) + " +
                        "sin(radians(:userLat)) * sin(radians(p.latitude)))) <= :radius " +
                        "AND (:cctv IS NULL OR p.cctv = :cctv) " +
                        "AND (:covered IS NULL OR p.covered = :covered) " +
                        "AND (:evCharging IS NULL OR p.evCharging = :evCharging) " +
                        "AND (:guard IS NULL OR p.guard = :guard)", countQuery = "SELECT count(p) FROM ParkingSpot p WHERE p.status = 'ACTIVE' AND "
                                        +
                                        "(6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) * " +
                                        "cos(radians(p.longitude) - radians(:userLng)) + " +
                                        "sin(radians(:userLat)) * sin(radians(p.latitude)))) <= :radius " +
                                        "AND (:cctv IS NULL OR p.cctv = :cctv) " +
                                        "AND (:covered IS NULL OR p.covered = :covered) " +
                                        "AND (:evCharging IS NULL OR p.evCharging = :evCharging) " +
                                        "AND (:guard IS NULL OR p.guard = :guard)")
        Page<ParkingSpot> findNearbySpots(
                        @org.springframework.data.repository.query.Param("userLat") double userLat,
                        @org.springframework.data.repository.query.Param("userLng") double userLng,
                        @org.springframework.data.repository.query.Param("radius") double radius,
                        @org.springframework.data.repository.query.Param("cctv") Boolean cctv,
                        @org.springframework.data.repository.query.Param("covered") Boolean covered,
                        @org.springframework.data.repository.query.Param("evCharging") Boolean evCharging,
                        @org.springframework.data.repository.query.Param("guard") Boolean guard,
                        Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT count(p) FROM ParkingSpot p WHERE p.status = 'ACTIVE' AND "
                        +
                        "(6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) * " +
                        "cos(radians(p.longitude) - radians(:userLng)) + " +
                        "sin(radians(:userLat)) * sin(radians(p.latitude)))) <= :radius")
        long countNearbySpots(
                        @org.springframework.data.repository.query.Param("userLat") double userLat,
                        @org.springframework.data.repository.query.Param("userLng") double userLng,
                        @org.springframework.data.repository.query.Param("radius") double radius);

        @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
        @org.springframework.data.jpa.repository.Query("SELECT p FROM ParkingSpot p WHERE p.id = :id")
        java.util.Optional<ParkingSpot> findByIdWithLock(
                        @org.springframework.data.repository.query.Param("id") Long id);
}
