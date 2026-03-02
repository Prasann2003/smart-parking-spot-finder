package com.smartparking.repository;

import com.smartparking.entity.ProviderApplication;
import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface ProviderApplicationRepository extends JpaRepository<ProviderApplication, Long> {

    @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
    List<ProviderApplication> findAll();

    @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
    Optional<ProviderApplication> findById(Long id);

    @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
    List<ProviderApplication> findByStatus(ProviderApplication.ApplicationStatus status);

    @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
    Optional<ProviderApplication> findByUserAndStatus(User user, ProviderApplication.ApplicationStatus status);

    @EntityGraph(attributePaths = { "vehicleConfigs", "imageUrls" })
    List<ProviderApplication> findByUser(User user);
}
