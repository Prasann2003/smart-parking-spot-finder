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
public class StartupDebugLogger implements org.springframework.boot.CommandLineRunner {

    private final ParkingSpotRepository parkingSpotRepository;
    private final ProviderRepository providerRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("=================================================");
        System.out.println("🔍 STARTUP DEBUG: Checking Database State");
        System.out.println("=================================================");

        long providerCount = providerRepository.count();
        System.out.println("👤 Total Providers: " + providerCount);
        List<Provider> providers = providerRepository.findAll();
        for (Provider p : providers) {
            System.out.println("   - Provider ID: " + p.getId() + " | Name: " + p.getFullName() +
                    " | User: " + (p.getUser() != null ? p.getUser().getEmail() : "NULL") +
                    " | Status: " + p.getVerificationStatus());
        }

        System.out.println("-------------------------------------------------");
        System.out.println("🚗 Checking Parking Spots...");

        List<ParkingSpot> allSpots = parkingSpotRepository.findAll();
        if (allSpots.isEmpty()) {
            System.out.println("❌ No parking spots found in database!");
        } else {
            for (ParkingSpot spot : allSpots) {
                System.out.printf("   - Spot ID: %d | Name: %s | Status: %s | Lat: %s | Lng: %s | Owner: %s%n",
                        spot.getId(),
                        spot.getName(),
                        spot.getStatus(),
                        spot.getLatitude(),
                        spot.getLongitude(),
                        spot.getProvider() != null ? spot.getProvider().getFullName() : "NULL");

                if (spot.getLatitude() == null || spot.getLatitude() == 0.0 ||
                        spot.getLongitude() == null || spot.getLongitude() == 0.0) {
                    System.out.println("     ⚠️ WARNING: Invalid Coordinates!");
                }
            }
        }
        System.out.println("=================================================");
    }
}
