package com.smartparking.repository;

import com.smartparking.entity.ProviderApplication;
import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderApplicationRepository extends JpaRepository<ProviderApplication, Long> {
    List<ProviderApplication> findByStatus(ProviderApplication.ApplicationStatus status);

    Optional<ProviderApplication> findByUserAndStatus(User user, ProviderApplication.ApplicationStatus status);

    List<ProviderApplication> findByUser(User user);
}
