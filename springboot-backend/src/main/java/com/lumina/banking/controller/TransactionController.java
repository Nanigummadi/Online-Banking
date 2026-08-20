package com.lumina.banking.controller;

import com.lumina.banking.dto.response.ApiResponse;
import com.lumina.banking.dto.response.TransactionResponse;
import com.lumina.banking.security.UserPrincipal;
import com.lumina.banking.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Transaction Management", description = "Endpoints for user transaction history and receipt tracking")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "Get transaction history for the authenticated user")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getMyTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<TransactionResponse> transactions = transactionService.getUserTransactions(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(transactions, "Transactions retrieved successfully"));
    }

    @GetMapping("/{reference}")
    @Operation(summary = "Retrieve specific transaction receipt by unique reference number")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionByReference(
            @PathVariable String reference) {
        TransactionResponse txn = transactionService.getTransactionByReference(reference);
        return ResponseEntity.ok(ApiResponse.ok(txn, "Transaction found"));
    }
}
