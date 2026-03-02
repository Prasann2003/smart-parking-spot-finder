package com.smartparking.repository;

import com.smartparking.entity.ParkingSpot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
        @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
        List<ParkingSpot> findAll();

        @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
        java.util.Optional<ParkingSpot> findById(Long id);

        @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
        List<ParkingSpot> findByProviderIdAndIsDeletedFalse(Long providerId);

        @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
        List<ParkingSpot> findByStateAndDistrictAndIsDeletedFalse(String state, String district);

        @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
        List<ParkingSpot> findByStatusAndIsDeletedFalse(com.smartparking.entity.ParkingSpot.ParkingStatus status);

        @Query("SELECT p FROM ParkingSpot p WHERE " +
                        "p.state = :state AND p.district = :district AND p.status = :status AND p.isDeleted = false " +
                        "AND (:cctv IS NULL OR p.cctv = :cctv) " +
                        "AND (:covered IS NULL OR p.covered = :covered) " +
                        "AND (:evCharging IS NULL OR p.evCharging = :evCharging) " +
                        "AND (:guard IS NULL OR p.guard = :guard)")
        Page<ParkingSpot> findByStateAndDistrictAndStatus(
                        @Param("state") String state,
                        @Param("district") String district,
                        @Param("status") com.smartparking.entity.ParkingSpot.ParkingStatus status,
                        @Param("cctv") Boolean cctv,
                        @Param("covered") Boolean covered,
                        @Param("evCharging") Boolean evCharging,
                        @Param("guard") Boolean guard,
                        Pageable pageable);

        @Query(value = "SELECT p FROM ParkingSpot p WHERE p.status = 'ACTIVE' AND p.isDeleted = false AND "
                        +
                        "(6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) * " +
                        "cos(radians(p.longitude) - radians(:userLng)) + " +
                        "sin(radians(:userLat)) * sin(radians(p.latitude)))) <= :radius " +
                        "AND (:cctv IS NULL OR p.cctv = :cctv) " +
                        "AND (:covered IS NULL OR p.covered = :covered) " +
                        "AND (:evCharging IS NULL OR p.evCharging = :evCharging) " +
                        "AND (:guard IS NULL OR p.guard = :guard)", countQuery = "SELECT count(p) FROM ParkingSpot p WHERE p.status = 'ACTIVE' AND p.isDeleted = false AND "
                                        +
                                        "(6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) * " +
                                        "cos(radians(p.longitude) - radians(:userLng)) + " +
                                        "sin(radians(:userLat)) * sin(radians(p.latitude)))) <= :radius " +
                                        "AND (:cctv IS NULL OR p.cctv = :cctv) " +
                                        "AND (:covered IS NULL OR p.covered = :covered) " +
                                        "AND (:evCharging IS NULL OR p.evCharging = :evCharging) " +
                                        "AND (:guard IS NULL OR p.guard = :guard)")
        Page<ParkingSpot> findNearbySpots(
                        @Param("userLat") double userLat,
                        @Param("userLng") double userLng,
                        @Param("radius") double radius,
                        @Param("cctv") Boolean cctv,
                        @Param("covered") Boolean covered,
                        @Param("evCharging") Boolean evCharging,
                        @Param("guard") Boolean guard,
                        Pageable pageable);

        @Query("SELECT count(p) FROM ParkingSpot p WHERE p.status = 'ACTIVE' AND p.isDeleted = false AND "
                        +
                        "(6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) * " +
                        "cos(radians(p.longitude) - radians(:userLng)) + " +
                        "sin(radians(:userLat)) * sin(radians(p.latitude)))) <= :radius")
        long countNearbySpots(
                        @Param("userLat") double userLat,
                        @Param("userLng") double userLng,
                        @Param("radius") double radius);

        @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT p FROM ParkingSpot p WHERE p.id = :id AND p.isDeleted = false")
        java.util.Optional<ParkingSpot> findByIdWithLock(
                        @Param("id") Long id);
}
