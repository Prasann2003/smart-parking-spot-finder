package com.smartparking.controller;

import com.smartparking.dto.ParkingSpotDTO;
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

    @PostMapping("/add")
    public ResponseEntity<ParkingSpotDTO> addParkingSpot(@Valid @RequestBody ParkingSpotDTO dto) {
        return ResponseEntity.ok(parkingSpotService.addParkingSpot(dto));
    }

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String filename = imageStorageService.store(file);
        // Return relative URL or full URL. Let's return the filename which
        // ImageController serves.
        // Frontend can append /api/images/
        return ResponseEntity.ok("/api/images/" + filename);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ParkingSpotDTO>> getAllParkingSpots() {
        return ResponseEntity.ok(parkingSpotService.getAllParkingSpots());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ParkingSpotDTO>> searchParkingSpots(@RequestParam String state,
            @RequestParam String district) {
        System.out.println("Searching for spots in State: " + state + ", District: " + district);
        return ResponseEntity.ok(parkingSpotService.searchParkingSpots(state, district));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<ParkingSpotDTO>> getNearbyParkingSpots(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius) {
        return ResponseEntity.ok(parkingSpotService.getNearbyParkingSpots(lat, lng, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingSpotDTO> getParkingSpotById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSpotService.getParkingSpotById(id));
    }
}
