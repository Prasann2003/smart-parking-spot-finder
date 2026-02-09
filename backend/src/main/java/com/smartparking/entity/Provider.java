package com.smartparking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "providers")
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String fullName;

    private String governmentId;
    private String panNumber;
    private String gstNumber;

    private String bankAccountNumber;
    private String upiId;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    private List<ParkingSpot> parkingSpots;

    public enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
    public static Provider fromApplication(ProviderApplication application) {
        if (application == null) {
            throw new IllegalArgumentException("ProviderApplication cannot be null");
        }

        Provider provider = new Provider();

        // User relation
        provider.setUser(application.getUser());

        // Basic identity
        provider.setFullName(application.getName());

        // Compliance & payment details
        provider.setPanNumber(application.getPanNumber());
        provider.setGstNumber(application.getGstNumber());
        provider.setBankAccountNumber(application.getBankAccount());
        provider.setUpiId(application.getUpiId());

        // Verification lifecycle
        provider.setVerificationStatus(VerificationStatus.APPROVED);

        return provider;
    }

}
