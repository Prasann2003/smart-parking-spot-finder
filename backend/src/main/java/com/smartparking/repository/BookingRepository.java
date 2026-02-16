package com.smartparking.repository;

import com.smartparking.entity.Booking;
import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long>,
                org.springframework.data.jpa.repository.JpaSpecificationExecutor<Booking> {
        List<Booking> findByUserId(Long userId);

        List<Booking> findByParkingSpotId(Long parkingSpotId);

        List<Booking> findByParkingSpot_Provider_User_Id(Long userId);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.platformFee) FROM Payment p WHERE p.status = 'SUCCESS'")
        Double calculateTotalRevenue();

        long countByStatus(Booking.BookingStatus status);

        Optional<Booking> findByIdAndUser(Long id, User user);

        @Query("SELECT COUNT(b) FROM Booking b WHERE b.parkingSpot.id = :spotId "
                        +
                        "AND b.vehicleType = :vehicleType " +
                        "AND b.status = 'CONFIRMED' " +
                        "AND (b.startTime < :endTime AND b.endTime > :startTime)")
        long countOverlappingBookings(@org.springframework.data.repository.query.Param("spotId") Long spotId,
                        @org.springframework.data.repository.query.Param("vehicleType") com.smartparking.entity.VehicleType vehicleType,
                        @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
                        @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime);

        @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.parkingSpot.id = :spotId " +
                        "AND b.status = 'CONFIRMED' " +
                        "AND b.startTime > :now")
        List<Booking> findFutureConfirmedBookings(
                        @org.springframework.data.repository.query.Param("spotId") Long spotId,
                        @org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);

        @Query("""
                            SELECT COUNT(b) FROM Booking b
                            WHERE b.user = :user
                            AND b.status = 'CONFIRMED'
                            AND :now BETWEEN b.startTime AND b.endTime
                        """)
        long countActiveBookings(@Param("user") User user,
                        @Param("now") LocalDateTime now);

        @Query("""
                            SELECT COUNT(b) FROM Booking b
                            WHERE b.parkingSpot.id = :spotId
                            AND b.status = 'CONFIRMED'
                            AND :now BETWEEN b.startTime AND b.endTime
                        """)
        long countCurrentBookingsForSpot(@Param("spotId") Long spotId,
                        @Param("now") LocalDateTime now);

        @org.springframework.data.jpa.repository.Modifying
        @org.springframework.data.jpa.repository.Query("UPDATE Booking b SET b.status = 'COMPLETED' WHERE b.status = 'CONFIRMED' AND b.endTime < :now")
        int updateExpiredBookings(@Param("now") LocalDateTime now);
}
