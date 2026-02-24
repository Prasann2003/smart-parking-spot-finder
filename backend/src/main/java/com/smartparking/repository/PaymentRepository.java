package com.smartparking.repository;

import com.smartparking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT new com.smartparking.dto.MonthlyRevenueDTO(" +
            "FUNCTION('DATE_FORMAT', p.paymentTime, '%Y-%m'), " +
            "SUM(p.amount), " +
            "SUM(p.platformFee)) " +
            "FROM Payment p " +
            "WHERE p.status = 'SUCCESS' " +
            "GROUP BY FUNCTION('DATE_FORMAT', p.paymentTime, '%Y-%m') " +
            "ORDER BY FUNCTION('DATE_FORMAT', p.paymentTime, '%Y-%m') ASC")
    List<com.smartparking.dto.MonthlyRevenueDTO> getMonthlyRevenue();
}
