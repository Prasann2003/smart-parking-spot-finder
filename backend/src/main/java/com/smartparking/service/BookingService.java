package com.smartparking.service;

import com.smartparking.dto.BookingDTO;
import com.smartparking.entity.*;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.PaymentRepository;
import com.smartparking.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
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
        private final com.smartparking.repository.NotificationRepository notificationRepository;

        public BookingDTO createBooking(BookingDTO dto) {
                String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                                .getUsername();
                User user = userRepository.findByEmailAndIsDeletedFalse(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Use Pessimistic Lock to prevent double booking
                ParkingSpot parkingSpot = parkingSpotRepository.findByIdWithLock(dto.getParkingSpotId())
                                .orElseThrow(() -> new RuntimeException("Parking Spot not found"));

                // Enforce 45-day advance booking limit
                long daysUntilStart = java.time.Duration.between(java.time.LocalDateTime.now(), dto.getStartTime())
                                .toDays();
                if (daysUntilStart > 45) {
                        throw new RuntimeException("Advance bookings are only allowed up to 45 days from today.");
                }

                // Chronological validation
                if (dto.getStartTime().isBefore(java.time.LocalDateTime.now().minusMinutes(5))) {
                        throw new RuntimeException("Start time cannot be in the past.");
                }
                if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().isEqual(dto.getStartTime())) {
                        throw new RuntimeException("End time must be after start time.");
                }

                // FIND VEHICLE CONFIG
                com.smartparking.entity.SpotVehicleConfig config = parkingSpot.getVehicleConfigs().stream()
                                .filter(c -> c.getVehicleType() == dto.getVehicleType())
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Vehicle type " + dto.getVehicleType()
                                                + " not supported by this spot"));

                // Calculate total price using DYNAMIC logic
                double totalPrice = calculateDynamicPrice(
                                dto.getStartTime(),
                                dto.getEndTime(),
                                config.getPricePerHour(),
                                parkingSpot.getWeekendSurcharge(),
                                parkingSpot.getMonthlyDiscountPercent(),
                                parkingSpot.isMonthlyPlan());

                // CHECK AVAILABILITY FOR VEHICLE TYPE
                long overlappingBookings = bookingRepository.countOverlappingBookings(
                                parkingSpot.getId(),
                                dto.getVehicleType(),
                                dto.getStartTime(),
                                dto.getEndTime());

                if (overlappingBookings >= config.getCapacity()) {
                        throw new RuntimeException(
                                        "No " + dto.getVehicleType() + " slots available for the selected time.");
                }

                Booking booking = Booking.builder()
                                .user(user)
                                .parkingSpot(parkingSpot)
                                .vehicleType(config.getVehicleType()) // Ensure consistency
                                .startTime(dto.getStartTime())
                                .endTime(dto.getEndTime())
                                .totalPrice(totalPrice)
                                .status(dto.getStartTime().isEqual(java.time.LocalDateTime.now())
                                                || dto.getStartTime().isBefore(java.time.LocalDateTime.now())
                                                                ? Booking.BookingStatus.ACTIVE
                                                                : Booking.BookingStatus.CONFIRMED)
                                .build();

                Booking savedBooking = bookingRepository.save(booking);

                // CREATE PAYMENT RECORD
                if (dto.getPaymentMethod() != null) {
                        double platformFee = totalPrice * 0.15;
                        double providerEarnings = totalPrice - platformFee;

                        com.smartparking.entity.Payment payment = com.smartparking.entity.Payment.builder()
                                        .amount(totalPrice)
                                        .platformFee(platformFee)
                                        .providerEarnings(providerEarnings)
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

        public org.springframework.data.domain.Page<BookingDTO> getUserBookings(
                        org.springframework.data.domain.Pageable pageable,
                        String filterStatus) {
                String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                                .getUsername();
                User user = userRepository.findByEmailAndIsDeletedFalse(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                org.springframework.data.jpa.domain.Specification<Booking> spec = (root, query, cb) -> {
                        jakarta.persistence.criteria.Predicate p = cb.equal(root.get("user"), user);

                        if (filterStatus != null && !filterStatus.isEmpty() && !filterStatus.equals("ALL")) {
                                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                                if (filterStatus.equals("ACTIVE")) {
                                        // Active means CONFIRMED and now between start and end
                                        p = cb.and(p,
                                                        root.get("status")
                                                                        .in(java.util.Arrays.asList(
                                                                                        Booking.BookingStatus.CONFIRMED,
                                                                                        Booking.BookingStatus.ACTIVE)),
                                                        cb.lessThanOrEqualTo(root.get("startTime"), now),
                                                        cb.greaterThanOrEqualTo(root.get("endTime"), now));
                                } else if (filterStatus.equals("UPCOMING")) {
                                        p = cb.and(p,
                                                        cb.equal(root.get("status"), Booking.BookingStatus.CONFIRMED),
                                                        cb.greaterThan(root.get("startTime"), now));
                                } else {
                                        try {
                                                p = cb.and(p, cb.equal(root.get("status"),
                                                                Booking.BookingStatus.valueOf(filterStatus)));
                                        } catch (IllegalArgumentException e) {
                                                // Ignore invalid status
                                        }
                                }
                        }
                        return p;
                };

                return bookingRepository.findAll(spec, pageable).map(this::mapToDTO);
        }

        public org.springframework.data.domain.Page<BookingDTO> getProviderBookings(
                        org.springframework.data.domain.Pageable pageable,
                        Long providerId,
                        Long spotId,
                        String status) {

                org.springframework.data.jpa.domain.Specification<Booking> spec = (root, query, cb) -> {
                        jakarta.persistence.criteria.Predicate p = cb.equal(
                                        root.get("parkingSpot").get("provider").get("id"), providerId);

                        if (spotId != null) {
                                p = cb.and(p, cb.equal(root.get("parkingSpot").get("id"), spotId));
                        }

                        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                                p = cb.and(p, cb.equal(root.get("status"), Booking.BookingStatus.valueOf(status)));
                        }

                        return p;
                };

                return bookingRepository.findAll(spec, pageable).map(this::mapToDTO);
        }

        public List<BookingDTO> getUserBookings() {
                String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                                .getUsername();
                User user = userRepository.findByEmailAndIsDeletedFalse(email)
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

        // ... existing getAvailableSlots ...

        public int getAvailableSlots(Long spotId, com.smartparking.entity.VehicleType vehicleType,
                        java.time.LocalDateTime startTime,
                        java.time.LocalDateTime endTime) {
                ParkingSpot spot = parkingSpotRepository.findById(spotId)
                                .orElseThrow(() -> new RuntimeException("Parking Spot not found"));

                // Enforce 45-day advance booking limit
                long daysUntilStart = java.time.Duration.between(java.time.LocalDateTime.now(), startTime).toDays();
                if (daysUntilStart > 45) {
                        return 0;
                }

                com.smartparking.entity.SpotVehicleConfig config = spot.getVehicleConfigs().stream()
                                .filter(c -> c.getVehicleType() == vehicleType)
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Vehicle type not supported"));

                long bookedCount = bookingRepository.countOverlappingBookings(spotId, vehicleType, startTime, endTime);

                int available = config.getCapacity() - (int) bookedCount;
                return Math.max(0, available);
        }

        private BookingDTO mapToDTO(Booking booking) {
                String paymentMethod = "N/A";
                Double platformFee = 0.0;
                Double providerEarnings = 0.0;
                if (booking.getPayment() != null) {
                        if (booking.getPayment().getPaymentMethod() != null) {
                                paymentMethod = booking.getPayment().getPaymentMethod().name();
                        }
                        platformFee = booking.getPayment().getPlatformFee();
                        providerEarnings = booking.getPayment().getProviderEarnings();
                }

                String spotName = "Unknown Spot";
                Long spotId = null;
                if (booking.getParkingSpot() != null) {
                        spotName = booking.getParkingSpot().getName();
                        spotId = booking.getParkingSpot().getId();
                }

                String userName = "Unknown User";
                String userEmail = "No Email";
                String userPhone = "N/A";
                if (booking.getUser() != null) {
                        userName = booking.getUser().getName();
                        userEmail = booking.getUser().getEmail();
                        userPhone = booking.getUser().getPhoneNumber() != null ? booking.getUser().getPhoneNumber()
                                        : "N/A";
                }

                String computedStatus = booking.getStatus() != null ? booking.getStatus().name() : "UNKNOWN";
                if (booking.getStatus() == Booking.BookingStatus.CONFIRMED
                                || booking.getStatus() == Booking.BookingStatus.ACTIVE) {
                        java.time.LocalDateTime now = java.time.LocalDateTime.now();
                        if ((now.isAfter(booking.getStartTime()) || now.isEqual(booking.getStartTime()))
                                        && now.isBefore(booking.getEndTime())) {
                                computedStatus = "ACTIVE";
                        }
                }

                return BookingDTO.builder()
                                .id(booking.getId())
                                .parkingSpotId(spotId)
                                .startTime(booking.getStartTime())
                                .endTime(booking.getEndTime())
                                .totalPrice(booking.getTotalPrice())
                                .status(booking.getStatus() != null ? booking.getStatus().name() : "UNKNOWN")
                                .computedStatus(computedStatus)
                                .parkingSpotName(spotName)
                                .paymentMethod(paymentMethod)
                                .createdAt(booking.getCreatedAt())
                                .vehicleType(booking.getVehicleType())
                                .userName(userName)
                                .userEmail(userEmail)
                                .userPhone(userPhone)
                                .isRated(booking.getRating() != null)
                                .ratingValue(booking.getRating() != null ? booking.getRating().getRatingValue() : null)
                                .platformFee(platformFee)
                                .providerEarnings(providerEarnings)
                                .build();
        }

        public BookingDTO getBookingById(Long id) {
                String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                                .getUsername();
                User user = userRepository.findByEmailAndIsDeletedFalse(email)
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

                // Rule: Cancel allowed only if start time is > 24 hours away
                long hoursUntilStart = Duration.between(java.time.LocalDateTime.now(), booking.getStartTime())
                                .toHours();
                if (hoursUntilStart < 24) {
                        throw new RuntimeException(
                                        "Cancellation is only allowed up to 24 hours before the booking start time.");
                }

                booking.setStatus(Booking.BookingStatus.CANCELLED);

                if (booking.getPayment() != null) {
                        booking.getPayment().setStatus(com.smartparking.entity.Payment.PaymentStatus.REFUNDED);
                }

                bookingRepository.save(booking);

                // Notify Provider
                if (booking.getParkingSpot() != null && booking.getParkingSpot().getProvider() != null
                                && booking.getParkingSpot().getProvider().getUser() != null) {

                        String userName = booking.getUser() != null ? booking.getUser().getName() : "a user";

                        com.smartparking.entity.Notification notification = com.smartparking.entity.Notification
                                        .builder()
                                        .user(booking.getParkingSpot().getProvider().getUser())
                                        .title("Booking Cancelled")
                                        .message("A booking at " + booking.getParkingSpot().getName()
                                                        + " for " + booking.getVehicleType()
                                                        + " has been cancelled by " + userName + ". "
                                                        + (booking.getPayment() != null ? "A refund has been initiated."
                                                                        : ""))
                                        .type("danger")
                                        .isRead(false)
                                        .build();
                        notificationRepository.save(notification);
                }
        }

        // private double calculateDynamicPrice(
        // java.time.LocalDateTime start,
        // java.time.LocalDateTime end,
        // double pricePerHour,
        // Double weekendSurcharge,
        // Double monthlyDiscountPercent,
        // boolean isMonthlyPlan) {
        //
        // long totalMinutes = Duration.between(start, end).toMinutes();
        // long totalHours = totalMinutes / 60;
        // if (totalMinutes % 60 > 0)
        // totalHours++;
        //
        // if (totalHours < 1)
        // totalHours = 1;
        //
        // double finalPrice = 0;
        // double currentBlockCost = 0;
        // int hoursInCurrentBlock = 0;
        // long HOURS_IN_30_DAYS = 30 * 24; // 720 hours
        //
        // double actualWeekendSurcharge = (weekendSurcharge != null) ? weekendSurcharge
        // : 0.0;
        // boolean canApplyDiscount = isMonthlyPlan
        // && (monthlyDiscountPercent != null && monthlyDiscountPercent > 0);
        //
        // // We use a loop for the number of hours.
        // java.time.LocalDateTime currentPointer = start;
        //
        // for (int i = 0; i < totalHours; i++) {
        // java.time.DayOfWeek day = currentPointer.getDayOfWeek();
        // boolean isWeekend = (day == java.time.DayOfWeek.SATURDAY || day ==
        // java.time.DayOfWeek.SUNDAY);
        //
        // double hourlyCost = pricePerHour;
        // if (isWeekend) {
        // hourlyCost += actualWeekendSurcharge;
        // }
        //
        // currentBlockCost += hourlyCost;
        // hoursInCurrentBlock++;
        //
        // if (hoursInCurrentBlock >= HOURS_IN_30_DAYS) {
        // if (canApplyDiscount) {
        // finalPrice += currentBlockCost * (1 - monthlyDiscountPercent / 100.0);
        // } else {
        // finalPrice += currentBlockCost;
        // }
        // currentBlockCost = 0;
        // hoursInCurrentBlock = 0;
        // }
        //
        // currentPointer = currentPointer.plusHours(1);
        // }
        //
        // finalPrice += currentBlockCost;
        //
        // return Math.round(finalPrice);
        // }
        private double calculateDynamicPrice(
                        java.time.LocalDateTime start,
                        java.time.LocalDateTime end,
                        double pricePerHour,
                        Double weekendSurcharge,
                        Double monthlyDiscountPercent,
                        boolean isMonthlyPlan) {

                long totalMinutes = Duration.between(start, end).toMinutes();
                long totalHours = totalMinutes / 60;
                if (totalMinutes % 60 > 0)
                        totalHours++;

                if (totalHours < 1)
                        totalHours = 1;

                long HOURS_IN_30_DAYS = 30 * 24; // 720 hours

                // ✅ Weekend surcharge ONLY if start date is weekend
                java.time.DayOfWeek startDay = start.getDayOfWeek();
                boolean isWeekendStart = (startDay == java.time.DayOfWeek.SATURDAY
                                || startDay == java.time.DayOfWeek.SUNDAY);

                double effectivePricePerHour = pricePerHour;

                if (isWeekendStart && weekendSurcharge != null) {
                        effectivePricePerHour += weekendSurcharge;
                }

                double finalPrice = 0;

                boolean canApplyDiscount = isMonthlyPlan
                                && monthlyDiscountPercent != null
                                && monthlyDiscountPercent > 0
                                && totalHours >= HOURS_IN_30_DAYS;

                if (canApplyDiscount) {

                        long fullMonths = totalHours / HOURS_IN_30_DAYS;
                        long remainingHours = totalHours % HOURS_IN_30_DAYS;

                        double oneMonthCost = HOURS_IN_30_DAYS * effectivePricePerHour;
                        oneMonthCost *= (1 - monthlyDiscountPercent / 100.0);

                        finalPrice = (fullMonths * oneMonthCost)
                                        + (remainingHours * effectivePricePerHour);

                } else {
                        finalPrice = totalHours * effectivePricePerHour;
                }

                return Math.round(finalPrice);
        }

        public void cancelAndUnlinkUserBookings(Long userId) {
                List<Booking> userBookings = bookingRepository.findByUserId(userId);
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                java.time.LocalDateTime refundDeadline = now.plusHours(24);

                for (Booking booking : userBookings) {
                        // Skip unconfirmed/active or already finished bookings
                        if ((booking.getStatus() != Booking.BookingStatus.CONFIRMED
                                        && booking.getStatus() != Booking.BookingStatus.ACTIVE)
                                        || !booking.getEndTime().isAfter(now)) {
                                continue;
                        }

                        // Skip active bookings or bookings starting within 24 hours
                        if (booking.getStatus() == Booking.BookingStatus.ACTIVE
                                        || !booking.getStartTime().isAfter(refundDeadline)) {
                                continue;
                        }

                        // Apply cancellation
                        booking.setStatus(Booking.BookingStatus.CANCELLED);

                        // Process refund safely (avoid double refunds)
                        if (booking.getPayment() != null &&
                                        booking.getPayment()
                                                        .getStatus() != com.smartparking.entity.Payment.PaymentStatus.REFUNDED) {
                                booking.getPayment().setStatus(com.smartparking.entity.Payment.PaymentStatus.REFUNDED);
                        }

                        bookingRepository.save(booking);
                }
        }

        @Transactional
        public void cancelAndUnlinkSpotBookings(Long spotId) {

                List<Booking> spotBookings = bookingRepository.findByParkingSpotId(spotId);
                LocalDateTime now = LocalDateTime.now();

                for (Booking booking : spotBookings) {

                        if ((booking.getStatus() != Booking.BookingStatus.CONFIRMED
                                        && booking.getStatus() != Booking.BookingStatus.ACTIVE)
                                        || !booking.getEndTime().isAfter(now)) {
                                continue;
                        }

                        // Skip ACTIVE bookings that are currently ongoing
                        if (booking.getStatus() == Booking.BookingStatus.ACTIVE || (now.isAfter(booking.getStartTime())
                                        && now.isBefore(booking.getEndTime()))) {
                                continue;
                        }

                        booking.setStatus(Booking.BookingStatus.CANCELLED);

                        boolean hasPayment = booking.getPayment() != null;

                        if (hasPayment) {
                                booking.getPayment()
                                                .setStatus(Payment.PaymentStatus.REFUNDED);
                        }

                        if (booking.getUser() != null) {

                                String spotName = booking.getParkingSpot() != null
                                                ? booking.getParkingSpot().getName()
                                                : "Unknown Spot";

                                String message = "Your booking at " + spotName +
                                                " has been cancelled because the provider is no longer available."
                                                + (hasPayment ? " A full refund has been initiated." : "");

                                Notification notification = Notification.builder()
                                                .user(booking.getUser())
                                                .title("Booking Cancelled")
                                                .message(message)
                                                .type("danger")
                                                .isRead(false)
                                                .build();

                                notificationRepository.save(notification);
                        }

                        bookingRepository.save(booking);
                }
        }
}
