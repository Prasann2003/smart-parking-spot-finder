package com.smartparking.service;

import com.smartparking.dto.ParkingSpotResponseDTO;
import com.smartparking.entity.ParkingSpot;
import com.smartparking.entity.SavedSpot;
import com.smartparking.entity.User;
import com.smartparking.repository.ParkingSpotRepository;
import com.smartparking.repository.SavedSpotRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedSpotService {

    private final SavedSpotRepository savedSpotRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final ParkingSpotService parkingSpotService;

    @Transactional
    public boolean toggleSavedSpot(Long spotId, User user) {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
                .orElseThrow(() -> new EntityNotFoundException("Parking spot not found"));

        Optional<SavedSpot> existing = savedSpotRepository.findByUserAndParkingSpot(user, spot);

        if (existing.isPresent()) {
            savedSpotRepository.delete(existing.get());
            return false; // Unsaved
        } else {
            SavedSpot savedSpot = SavedSpot.builder()
                    .user(user)
                    .parkingSpot(spot)
                    .build();
            savedSpotRepository.save(savedSpot);
            return true; // Saved
        }
    }

    @Transactional(readOnly = true)
    public List<ParkingSpotResponseDTO> getSavedSpots(User user) {
        List<SavedSpot> savedSpots = savedSpotRepository.findByUser(user);
        return savedSpots.stream()
                .map(ss -> parkingSpotService.mapToDTO(ss.getParkingSpot()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Long> getSavedSpotIds(User user) {
        return savedSpotRepository.findByUser(user).stream()
                .map(ss -> ss.getParkingSpot().getId())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countSavedSpots(User user) {
        return savedSpotRepository.countByUser(user);
    }
}
