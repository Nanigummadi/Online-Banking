package com.lumina.banking.service;

import com.lumina.banking.dto.response.AdminMetricsResponse;
import com.lumina.banking.dto.response.TransactionResponse;
import com.lumina.banking.dto.response.WalletResponse;

import java.util.List;

public interface AdminService {
    AdminMetricsResponse getDashboardMetrics();
    List<WalletResponse> getAllWallets();
    List<TransactionResponse> getAllTransactions();
}
