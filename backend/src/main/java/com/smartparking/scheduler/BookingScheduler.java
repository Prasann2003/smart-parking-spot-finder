package com.smartparking.scheduler;

import com.smartparking.repository.BookingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class BookingScheduler {

    private final BookingRepository bookingRepository;

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void autoCompleteBookings() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Activate bookings that have started
        int activatedCount = bookingRepository.updateActiveBookings(now);
        if (activatedCount > 0) {
            log.info("▶️ Auto-Activated {} bookings at {}", activatedCount, now);
        }

        // 2. Complete bookings that have ended
        int updatedCount = bookingRepository.updateExpiredBookings(now);
        if (updatedCount > 0) {
            log.info("🔄 Auto-Completed {} expired bookings at {}", updatedCount, now);
        }
    }
}
