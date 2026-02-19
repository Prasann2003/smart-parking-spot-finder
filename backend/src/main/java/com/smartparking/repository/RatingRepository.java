package com.smartparking.repository;

import com.smartparking.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
        boolean existsByBookingId(Long bookingId);

        @org.springframework.data.jpa.repository.Query("SELECT r FROM Rating r JOIN FETCH r.user WHERE r.parkingSpot.id = :parkingSpotId")
        List<Rating> findByParkingSpotId(
                        @org.springframework.data.repository.query.Param("parkingSpotId") Long parkingSpotId);

        @org.springframework.data.jpa.repository.Query("SELECT r FROM Rating r JOIN FETCH r.user WHERE r.parkingSpot.id = :parkingSpotId")
        org.springframework.data.domain.Page<Rating> findByParkingSpotId(
                        @org.springframework.data.repository.query.Param("parkingSpotId") Long parkingSpotId,
                        org.springframework.data.domain.Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM Rating r WHERE r.parkingSpot.id = :spotId")
        Long countByParkingSpotId(Long spotId);

        @org.springframework.data.jpa.repository.Query("SELECT COALESCE(AVG(r.ratingValue), 0.0) FROM Rating r WHERE r.parkingSpot.id = :spotId")
        Double getAverageRating(Long spotId);

        void deleteByUserId(Long userId);

        void deleteByParkingSpotId(Long parkingSpotId);
}
