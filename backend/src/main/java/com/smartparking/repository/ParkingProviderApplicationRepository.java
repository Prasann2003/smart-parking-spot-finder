package com.smartparking.repository;


import com.smartparking.entity.ProviderApplication;
import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParkingProviderApplicationRepository extends JpaRepository<ProviderApplication, Long> {
    List<ProviderApplication> findByStatus(ProviderApplication.ApplicationStatus status);
//
//    Optional<ProviderApplication> findByOwnerAndStatus(User owner,
//            ProviderApplication.ApplicationStatus status);
//
//    List<ProviderApplication> findByOwner(User owner);
    Optional<ProviderApplication> findByUser(User user);
}
