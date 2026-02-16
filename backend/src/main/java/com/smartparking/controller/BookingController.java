package com.smartparking.controller;

import com.smartparking.dto.BookingDTO;
import com.smartparking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingDTO dto) {
        return ResponseEntity.ok(bookingService.createBooking(dto));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<org.springframework.data.domain.Page<BookingDTO>> getUserBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        org.springframework.data.domain.Sort.Direction sortDirection = direction.equalsIgnoreCase("asc")
                ? org.springframework.data.domain.Sort.Direction.ASC
                : org.springframework.data.domain.Sort.Direction.DESC;

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by(sortDirection, sortBy));

        return ResponseEntity.ok(bookingService.getUserBookings(pageable, status));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Integer> checkAvailability(
            @RequestParam Long parkingSpotId,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam(required = false) com.smartparking.entity.VehicleType vehicleType) {

        // Frontend sends "yyyy-MM-dd HH:mm:ss"
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                .ofPattern("yyyy-MM-dd HH:mm:ss");
        java.time.LocalDateTime start = java.time.LocalDateTime.parse(startTime, formatter);
        java.time.LocalDateTime end = java.time.LocalDateTime.parse(endTime, formatter);

        return ResponseEntity.ok(bookingService.getAvailableSlots(parkingSpotId, vehicleType, start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok("Booking cancelled successfully. Payment refunded.");
    }
}
