package com.smartparking.repository;

import com.smartparking.entity.ParkingSpot;
import com.smartparking.entity.SavedSpot;
import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSpotRepository extends JpaRepository<SavedSpot, Long> {

    boolean existsByUserAndParkingSpot(User user, ParkingSpot parkingSpot);

    List<SavedSpot> findByUser(User user);

    long countByUser(User user);

    Optional<SavedSpot> findByUserAndParkingSpot(User user, ParkingSpot parkingSpot);
}
