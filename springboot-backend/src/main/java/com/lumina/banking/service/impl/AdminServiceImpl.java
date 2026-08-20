package com.lumina.banking.service.impl;

import com.lumina.banking.dto.response.AdminMetricsResponse;
import com.lumina.banking.dto.response.TransactionResponse;
import com.lumina.banking.dto.response.WalletResponse;
import com.lumina.banking.entity.Transaction;
import com.lumina.banking.entity.Wallet;
import com.lumina.banking.repository.TransactionRepository;
import com.lumina.banking.repository.UserRepository;
import com.lumina.banking.repository.WalletRepository;
import com.lumina.banking.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminMetricsResponse getDashboardMetrics() {
        long totalUsers = userRepository.count();
        long totalWallets = walletRepository.count();
        long totalTransactions = transactionRepository.count();
        BigDecimal totalVolume = transactionRepository.getTotalSystemVolume();

        List<Transaction> recent = transactionRepository.findAll(
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<TransactionResponse> recentDtos = recent.stream().map(this::mapToTransactionResponse).collect(Collectors.toList());

        return AdminMetricsResponse.builder()
                .totalUsers(totalUsers)
                .totalWallets(totalWallets)
                .totalTransactions(totalTransactions)
                .totalSystemVolume(totalVolume != null ? totalVolume : BigDecimal.ZERO)
                .recentTransactions(recentDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WalletResponse> getAllWallets() {
        return walletRepository.findAll().stream().map(this::mapToWalletResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(this::mapToTransactionResponse).collect(Collectors.toList());
    }

    private WalletResponse mapToWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .walletNumber(wallet.getWalletNumber())
                .balance(wallet.getBalance())
                .userId(wallet.getUser().getId())
                .userName(wallet.getUser().getFullName())
                .userEmail(wallet.getUser().getEmail())
                .createdAt(wallet.getCreatedAt())
                .build();
    }

    private TransactionResponse mapToTransactionResponse(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionReference(txn.getTransactionReference())
                .senderWalletId(txn.getSenderWallet() != null ? txn.getSenderWallet().getId() : null)
                .receiverWalletId(txn.getReceiverWallet().getId())
                .senderName(txn.getSenderName())
                .receiverName(txn.getReceiverName())
                .senderEmail(txn.getSenderEmail())
                .receiverEmail(txn.getReceiverEmail())
                .amount(txn.getAmount())
                .transactionType(txn.getTransactionType())
                .transactionStatus(txn.getTransactionStatus())
                .description(txn.getDescription())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
