package com.lumina.banking.controller;

import com.lumina.banking.dto.response.AdminMetricsResponse;
import com.lumina.banking.dto.response.ApiResponse;
import com.lumina.banking.dto.response.TransactionResponse;
import com.lumina.banking.dto.response.WalletResponse;
import com.lumina.banking.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Admin Operations", description = "Endpoints for System Metrics, Financial Audits, and Global Monitoring")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    @Operation(summary = "Get system overview metrics, total volume, active users, and recent system transactions")
    public ResponseEntity<ApiResponse<AdminMetricsResponse>> getDashboardMetrics() {
        AdminMetricsResponse metrics = adminService.getDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics, "Admin metrics retrieved successfully"));
    }

    @GetMapping("/wallets")
    @Operation(summary = "List all customer wallets and balances in the system")
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getAllWallets() {
        List<WalletResponse> wallets = adminService.getAllWallets();
        return ResponseEntity.ok(ApiResponse.ok(wallets, "All wallets retrieved successfully"));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Audit all system transactions in reverse chronological order")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAllTransactions() {
        List<TransactionResponse> transactions = adminService.getAllTransactions();
        return ResponseEntity.ok(ApiResponse.ok(transactions, "All transactions retrieved successfully"));
    }
}
