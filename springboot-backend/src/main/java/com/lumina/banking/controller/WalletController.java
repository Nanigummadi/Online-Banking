package com.lumina.banking.controller;

import com.lumina.banking.dto.request.AddMoneyRequest;
import com.lumina.banking.dto.request.TransferRequest;
import com.lumina.banking.dto.response.ApiResponse;
import com.lumina.banking.dto.response.TransactionResponse;
import com.lumina.banking.dto.response.WalletResponse;
import com.lumina.banking.security.UserPrincipal;
import com.lumina.banking.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Wallet Operations", description = "Wallet Balance, Money Deposits, and Atomic Transfer Operations")
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    @Operation(summary = "Get currently authenticated user's wallet details and balance")
    public ResponseEntity<ApiResponse<WalletResponse>> getMyWallet(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        WalletResponse wallet = walletService.getWalletByUserId(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(wallet, "Wallet retrieved successfully"));
    }

    @PostMapping("/add-money")
    @Operation(summary = "Deposit funds into wallet (simulated gateway)")
    public ResponseEntity<ApiResponse<TransactionResponse>> addMoney(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddMoneyRequest request) {
        TransactionResponse txn = walletService.addMoney(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(txn, "Funds added successfully"));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Execute atomic money transfer between wallets with ACID isolation")
    public ResponseEntity<ApiResponse<TransactionResponse>> transferMoney(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TransferRequest request) {
        TransactionResponse txn = walletService.transferMoney(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(txn, "Transfer completed successfully"));
    }
}
