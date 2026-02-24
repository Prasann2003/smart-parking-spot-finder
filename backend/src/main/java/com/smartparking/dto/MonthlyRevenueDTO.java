package com.smartparking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MonthlyRevenueDTO {
    private String month;
    private Double totalRevenue;
    private Double platformEarnings;

    public MonthlyRevenueDTO(Object month, Double totalRevenue, Double platformEarnings) {
        this.month = month != null ? String.valueOf(month) : "Unknown";
        this.totalRevenue = totalRevenue != null ? totalRevenue : 0.0;
        this.platformEarnings = platformEarnings != null ? platformEarnings : 0.0;
    }
}
