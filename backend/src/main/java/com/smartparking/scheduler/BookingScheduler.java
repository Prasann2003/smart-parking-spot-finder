package com.smartparking.scheduler;

import com.smartparking.repository.BookingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class BookingScheduler {

    private final BookingRepository bookingRepository;

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void autoCompleteBookings() {
        LocalDateTime now = LocalDateTime.now();
        int updatedCount = bookingRepository.updateExpiredBookings(now);
        if (updatedCount > 0) {
            System.out.println("🔄 Auto-Completed " + updatedCount + " expired bookings at " + now);
        }
    }
}
