package com.smartparking.controller;

import com.smartparking.dto.RatingDTO;
import com.smartparking.entity.Rating;
import com.smartparking.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<Rating> submitRating(Principal principal, @RequestBody RatingDTO dto) {
        return ResponseEntity.ok(ratingService.submitRating(principal.getName(), dto));
    }

    @GetMapping("/spot/{spotId}")
    public ResponseEntity<java.util.List<com.smartparking.dto.RatingResponseDTO>> getReviews(
            @PathVariable Long spotId) {
        java.util.List<com.smartparking.dto.RatingResponseDTO> reviews = ratingService.getReviewsBySpotId(spotId);
        System.out.println("DEBUG: Fetching reviews for spot " + spotId + ". Found: " + reviews.size());
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/spot/{spotId}/paged")
    public ResponseEntity<org.springframework.data.domain.Page<com.smartparking.dto.RatingResponseDTO>> getReviewsPaged(
            @PathVariable Long spotId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(ratingService.getReviewsBySpotId(spotId, page, size, sortBy, direction));
    }
}
