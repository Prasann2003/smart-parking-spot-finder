package com.smartparking.config;

import com.smartparking.entity.ParkingSpot;
import com.smartparking.entity.Provider;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.ProviderRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class StartupDebugLogger implements org.springframework.boot.CommandLineRunner {

    private final ParkingSpotRepository parkingSpotRepository;
    private final ProviderRepository providerRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=================================================");
        log.info("🔍 STARTUP DEBUG: Checking Database State");
        log.info("=================================================");

        long providerCount = providerRepository.count();
        log.info("👤 Total Providers: {}", providerCount);
        List<Provider> providers = providerRepository.findAll();
        for (Provider p : providers) {
            log.info("   - Provider ID: {} | Name: {} | User: {} | Status: {}",
                    p.getId(), p.getFullName(),
                    (p.getUser() != null ? p.getUser().getEmail() : "NULL"),
                    p.getVerificationStatus());
        }

        log.info("-------------------------------------------------");
        log.info("🚗 Checking Parking Spots...");

        List<ParkingSpot> allSpots = parkingSpotRepository.findAll();
        if (allSpots.isEmpty()) {
            log.warn("❌ No parking spots found in database!");
        } else {
            for (ParkingSpot spot : allSpots) {
                log.info("   - Spot ID: {} | Name: {} | Status: {} | Lat: {} | Lng: {} | Owner: {}",
                        spot.getId(),
                        spot.getName(),
                        spot.getStatus(),
                        spot.getLatitude(),
                        spot.getLongitude(),
                        spot.getProvider() != null ? spot.getProvider().getFullName() : "NULL");

                if (spot.getLatitude() == null || spot.getLatitude() == 0.0 ||
                        spot.getLongitude() == null || spot.getLongitude() == 0.0) {
                    log.warn("     ⚠️ WARNING: Invalid Coordinates!");
                }
            }
        }
        log.info("=================================================");
    }
}
