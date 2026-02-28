package com.smartparking.repository;

import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsDeletedFalse(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIsDeletedFalse(String email);

    long countByRole(com.smartparking.entity.Role role);

    long countByRoleAndIsDeletedFalse(com.smartparking.entity.Role role);

    org.springframework.data.domain.Page<User> findByRole(com.smartparking.entity.Role role,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<User> findByRoleAndIsDeletedFalse(com.smartparking.entity.Role role,
            org.springframework.data.domain.Pageable pageable);
}
