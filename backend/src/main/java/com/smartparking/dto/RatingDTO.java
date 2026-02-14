package com.smartparking.dto;

import lombok.Data;

@Data
public class RatingDTO {
    private Long bookingId;
    private Integer ratingValue;
    private String reviewComment;
}
