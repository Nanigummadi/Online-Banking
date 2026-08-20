package com.lumina.banking.service.impl;

import com.lumina.banking.dto.response.TransactionResponse;
import com.lumina.banking.entity.Transaction;
import com.lumina.banking.entity.Wallet;
import com.lumina.banking.exception.ResourceNotFoundException;
import com.lumina.banking.repository.TransactionRepository;
import com.lumina.banking.repository.WalletRepository;
import com.lumina.banking.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        List<Transaction> transactions = transactionRepository.findByWalletId(wallet.getId());
        return transactions.stream().map(this::mapToTransactionResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionByReference(String reference) {
        Transaction txn = transactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found for reference: " + reference));

        return mapToTransactionResponse(txn);
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
