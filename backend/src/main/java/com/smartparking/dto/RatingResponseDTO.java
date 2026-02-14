package com.smartparking.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RatingResponseDTO {
    private Long id;
    private Integer ratingValue;
    private String reviewComment;
    private String userName;
    private LocalDateTime createdAt;
}
