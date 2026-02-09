package com.smartparking.repository;

import com.smartparking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    List<Booking> findByParkingSpotId(Long parkingSpotId);

    List<Booking> findByParkingSpot_Provider_User_Id(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(b.totalPrice) FROM Booking b")
    Double calculateTotalRevenue();

    long countByStatus(String status);
}
