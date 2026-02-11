package com.smartparking.service;

import com.smartparking.dto.BookingDTO;
import com.smartparking.entity.Booking;
import com.smartparking.entity.ParkingSpot;
import com.smartparking.entity.User;
import com.smartparking.exception.NotFoundException;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.PaymentRepository;
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
        private final PaymentRepository paymentRepository;

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

                // CHECK AVAILABILITY
                long overlappingBookings = bookingRepository.countOverlappingBookings(
                                parkingSpot.getId(),
                                dto.getStartTime(),
                                dto.getEndTime());

                if (overlappingBookings >= parkingSpot.getTotalCapacity()) {
                        throw new RuntimeException("Parking spot is fully booked for the selected time.");
                }

                Booking booking = Booking.builder()
                                .user(user)
                                .parkingSpot(parkingSpot)
                                .startTime(dto.getStartTime())
                                .endTime(dto.getEndTime())
                                .totalPrice(totalPrice)
                                .status(Booking.BookingStatus.CONFIRMED)
                                .build();

                Booking savedBooking = bookingRepository.save(booking);

                // CREATE PAYMENT RECORD
                if (dto.getPaymentMethod() != null) {
                        com.smartparking.entity.Payment payment = com.smartparking.entity.Payment.builder()
                                        .amount(totalPrice)
                                        .paymentMethod(com.smartparking.entity.Payment.PaymentMethod
                                                        .valueOf(dto.getPaymentMethod()))
                                        .status(com.smartparking.entity.Payment.PaymentStatus.SUCCESS)
                                        .paymentTime(java.time.LocalDateTime.now())
                                        .transactionId("TXN_" + System.currentTimeMillis())
                                        .booking(savedBooking)
                                        .build();

                        paymentRepository.save(payment);
                }

                return mapToDTO(savedBooking);
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

        public int getAvailableSlots(Long spotId, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime) {
                ParkingSpot spot = parkingSpotRepository.findById(spotId)
                                .orElseThrow(() -> new RuntimeException("Parking Spot not found"));

                long bookedCount = bookingRepository.countOverlappingBookings(spotId, startTime, endTime);

                int available = spot.getTotalCapacity() - (int) bookedCount;
                return Math.max(0, available);
        }

        private BookingDTO mapToDTO(Booking booking) {
                String paymentMethod = booking.getPayment() != null ? booking.getPayment().getPaymentMethod().name()
                                : "N/A";

                return BookingDTO.builder()
                                .id(booking.getId())
                                .parkingSpotId(booking.getParkingSpot().getId())
                                .startTime(booking.getStartTime())
                                .endTime(booking.getEndTime())
                                .totalPrice(booking.getTotalPrice())
                                .status(booking.getStatus().name())
                                .parkingSpotName(booking.getParkingSpot().getName())
                                .paymentMethod(paymentMethod)
                                .createdAt(booking.getCreatedAt())
                                .userName(booking.getUser().getName())
                                .userEmail(booking.getUser().getEmail())
                                .userPhone(booking.getUser().getPhoneNumber() != null
                                                ? booking.getUser().getPhoneNumber()
                                                : "N/A")
                                .build();
        }

        public BookingDTO getBookingById(Long id) {
                String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                                .getUsername();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return bookingRepository.findByIdAndUser(id, user).map(this::mapToDTO)
                                .orElseThrow(() -> new RuntimeException("Booking not found by id: " + id));

        }

        public void cancelBooking(Long bookingId) {
                String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                                .getUsername();
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                if (!booking.getUser().getEmail().equals(email)) {
                        throw new RuntimeException("You are not authorized to cancel this booking");
                }

                if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
                        throw new RuntimeException("Booking is already cancelled");
                }

                // Rule: Cancel allowed only if start time is < 48 hours away
                long hoursUntilStart = Duration.between(java.time.LocalDateTime.now(), booking.getStartTime())
                                .toHours();
                if (hoursUntilStart > 48) {
                        throw new RuntimeException(
                                        "Cancellation is only allowed within 48 hours of the booking start time.");
                }

                booking.setStatus(Booking.BookingStatus.CANCELLED);

                if (booking.getPayment() != null) {
                        booking.getPayment().setStatus(com.smartparking.entity.Payment.PaymentStatus.REFUNDED);
                }

                bookingRepository.save(booking);
        }
}
