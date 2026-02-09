package com.smartparking.repository;

import com.smartparking.entity.Provider;
import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ProviderRepository extends JpaRepository<Provider, Long> {
    Optional<Provider> findByUser(User user);

    List<Provider> findByVerificationStatus(Provider.VerificationStatus status);
}
