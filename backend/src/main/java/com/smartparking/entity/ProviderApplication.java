package com.smartparking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "provider_applications")
public class ProviderApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_spot_id")
    private ParkingSpot parkingSpot; // The first spot submitted with application

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private String adminRemarks;

    @CreationTimestamp
    private LocalDateTime submissionDate;

    private LocalDateTime decisionDate;

    public enum ApplicationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
