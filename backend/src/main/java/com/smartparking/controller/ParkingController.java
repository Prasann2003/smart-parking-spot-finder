package com.smartparking.controller;

import com.smartparking.dto.ParkingSpotDTO;
import com.smartparking.dto.ParkingSpotResponseDTO;
import com.smartparking.service.ParkingSpotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
public class ParkingController {

    private final ParkingSpotService parkingSpotService;
    private final com.smartparking.service.ImageStorageService imageStorageService;

    // addParkingSpot removed - use ProviderService via ProviderController

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String filename = imageStorageService.store(file);
        // Return relative URL or full URL. Let's return the filename which
        // ImageController serves.
        // Frontend can append /api/images/
        return ResponseEntity.ok("/api/images/" + filename);
    }

    @PostMapping(value = "/add", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> addParkingSpot(
            @ModelAttribute ParkingSpotDTO parkingSpotDTO) {
        parkingSpotService.save(parkingSpotDTO);
        return ResponseEntity.ok("success");
    }

    @GetMapping("/all")
    public ResponseEntity<List<ParkingSpotResponseDTO>> getAllParkingSpots() {
        return ResponseEntity.ok(parkingSpotService.getAllParkingSpots());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ParkingSpotResponseDTO>> searchParkingSpots(@RequestParam String state,
            @RequestParam String district) {
        System.out.println("Searching for spots in State: " + state + ", District: " + district);
        return ResponseEntity.ok(parkingSpotService.searchParkingSpots(state, district));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<ParkingSpotResponseDTO>> getNearbyParkingSpots(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius) {
        return ResponseEntity.ok(parkingSpotService.getNearbyParkingSpots(lat, lng, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingSpotResponseDTO> getParkingSpotById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSpotService.getParkingSpotById(id));
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<ParkingSpotResponseDTO> getParkingSpotView(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSpotService.getParkingSpotById(id));
    }
}
