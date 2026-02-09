package com.smartparking.service;

import com.smartparking.dto.BookingDTO;
import com.smartparking.entity.Booking;
import com.smartparking.entity.ParkingSpot;
import com.smartparking.entity.User;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;

    public BookingDTO createBooking(BookingDTO dto) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ParkingSpot parkingSpot = parkingSpotRepository.findById(dto.getParkingSpotId())
                .orElseThrow(() -> new RuntimeException("Parking Spot not found"));

        // Calculate total price
        long hours = Duration.between(dto.getStartTime(), dto.getEndTime()).toHours();
        if (hours < 1)
            hours = 1; // Minimum 1 hour
        double totalPrice = hours * parkingSpot.getPricePerHour();

        Booking booking = Booking.builder()
                .user(user)
                .parkingSpot(parkingSpot)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);

        return mapToDTO(saved);
    }

    public List<BookingDTO> getUserBookings() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUserId(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByOwner(Long ownerId) {
        return bookingRepository.findByParkingSpot_Provider_User_Id(ownerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .parkingSpotId(booking.getParkingSpot().getId())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus().name())
                .parkingSpotName(booking.getParkingSpot().getName())
                .build();
    }
}
