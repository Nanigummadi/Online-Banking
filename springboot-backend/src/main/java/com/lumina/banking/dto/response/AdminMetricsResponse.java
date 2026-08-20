package com.lumina.banking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMetricsResponse {
    private long totalUsers;
    private long totalWallets;
    private BigDecimal totalSystemVolume;
    private long totalTransactions;
    private List<TransactionResponse> recentTransactions;
}
