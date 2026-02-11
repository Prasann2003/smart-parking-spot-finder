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
    public ResponseEntity<List<BookingDTO>> getUserBookings() {
        return ResponseEntity.ok(bookingService.getUserBookings());
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Integer> checkAvailability(
            @RequestParam Long parkingSpotId,
            @RequestParam String startTime,
            @RequestParam String endTime) {

        // Frontend sends "yyyy-MM-dd HH:mm:ss"
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                .ofPattern("yyyy-MM-dd HH:mm:ss");
        java.time.LocalDateTime start = java.time.LocalDateTime.parse(startTime, formatter);
        java.time.LocalDateTime end = java.time.LocalDateTime.parse(endTime, formatter);

        return ResponseEntity.ok(bookingService.getAvailableSlots(parkingSpotId, start, end));
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
