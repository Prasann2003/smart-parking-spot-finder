package com.smartparking.repository;

import com.smartparking.entity.Booking;
import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
        List<Booking> findByUserId(Long userId);

        List<Booking> findByParkingSpotId(Long parkingSpotId);

        List<Booking> findByParkingSpot_Provider_User_Id(Long userId);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(b.totalPrice) FROM Booking b")
        Double calculateTotalRevenue();

        long countByStatus(Booking.BookingStatus status);

        Optional<Booking> findByIdAndUser(Long id, User user);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.parkingSpot.id = :spotId "
                        +
                        "AND b.status = 'CONFIRMED' " +
                        "AND (b.startTime < :endTime AND b.endTime > :startTime)")
        long countOverlappingBookings(@org.springframework.data.repository.query.Param("spotId") Long spotId,
                        @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
                        @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime);

        @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.parkingSpot.id = :spotId " +
                        "AND b.status = 'CONFIRMED' " +
                        "AND b.startTime > :now")
        List<Booking> findFutureConfirmedBookings(
                        @org.springframework.data.repository.query.Param("spotId") Long spotId,
                        @org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);
}
