package com.smartparking.controller;

import com.smartparking.dto.ParkingSpotDTO;
import com.smartparking.dto.ParkingSpotResponseDTO;
import com.smartparking.service.ParkingSpotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
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
    public ResponseEntity<?> addParkingSpot(
            @ModelAttribute @jakarta.validation.Valid ParkingSpotDTO parkingSpotDTO,
            org.springframework.validation.BindingResult result) {

        if (result.hasErrors()) {
            java.util.List<String> errors = result.getAllErrors().stream()
                    .map(e -> e.getDefaultMessage())
                    .collect(java.util.stream.Collectors.toList());

            log.error("AddParking Validation Errors: {}", errors);
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Validation Failed", "errors", errors));
        }

        parkingSpotService.save(parkingSpotDTO);
        return ResponseEntity.ok("success");
    }

    @GetMapping("/all")
    public ResponseEntity<List<ParkingSpotResponseDTO>> getAllParkingSpots() {
        return ResponseEntity.ok(parkingSpotService.getAllParkingSpots());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ParkingSpotResponseDTO>> searchParkingSpots(
            @RequestParam String state,
            @RequestParam String district,
            @RequestParam(required = false) Boolean cctv,
            @RequestParam(required = false) Boolean covered,
            @RequestParam(required = false) Boolean evCharging,
            @RequestParam(required = false) Boolean guard,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "id,desc") String[] sort) { // Accept
                                                                                       // sort
        log.info("Searching for spots in State: {}, District: {} | Page: {}", state, district, page);

        // Convert sort array (e.g. ["averageRating,desc"]) to Sort object
        org.springframework.data.domain.Sort sortObj = org.springframework.data.domain.Sort.by(
                sort[1].equalsIgnoreCase("asc") ? org.springframework.data.domain.Sort.Direction.ASC
                        : org.springframework.data.domain.Sort.Direction.DESC,
                sort[0]);

        Pageable pageable = PageRequest.of(page, size, sortObj);
        return ResponseEntity
                .ok(parkingSpotService.searchParkingSpots(state, district, cctv, covered, evCharging, guard, pageable));
    }

    @GetMapping("/nearby")
    public ResponseEntity<Page<ParkingSpotResponseDTO>> getNearbyParkingSpots(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius,
            @RequestParam(required = false) Boolean cctv,
            @RequestParam(required = false) Boolean covered,
            @RequestParam(required = false) Boolean evCharging,
            @RequestParam(required = false) Boolean guard,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "id,desc") String[] sort) {

        // If user wants to sort by "distance", we can't do it via Pageable easily
        // without returning distance in select.
        // We'll map "distance" to default or leave PageRequest default, and handle
        // "rating" sorting natively
        org.springframework.data.domain.Sort sortObj = org.springframework.data.domain.Sort.unsorted();
        if (sort != null && sort.length >= 2 && !sort[0].equalsIgnoreCase("distance")) {
            sortObj = org.springframework.data.domain.Sort.by(
                    sort[1].equalsIgnoreCase("asc") ? org.springframework.data.domain.Sort.Direction.ASC
                            : org.springframework.data.domain.Sort.Direction.DESC,
                    sort[0]);
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        return ResponseEntity
                .ok(parkingSpotService.getNearbyParkingSpots(lat, lng, radius, cctv, covered, evCharging, guard,
                        pageable));
    }

    @GetMapping("/nearby/count")
    public ResponseEntity<Long> getNearbySpotsCount(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius) {
        return ResponseEntity.ok(parkingSpotService.getNearbySpotsCount(lat, lng, radius));
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
