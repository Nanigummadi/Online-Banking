package com.lumina.banking.service.impl;

import com.lumina.banking.dto.request.AddMoneyRequest;
import com.lumina.banking.dto.request.TransferRequest;
import com.lumina.banking.dto.response.TransactionResponse;
import com.lumina.banking.dto.response.WalletResponse;
import com.lumina.banking.entity.*;
import com.lumina.banking.exception.BadRequestException;
import com.lumina.banking.exception.InsufficientBalanceException;
import com.lumina.banking.exception.ResourceNotFoundException;
import com.lumina.banking.repository.TransactionRepository;
import com.lumina.banking.repository.UserRepository;
import com.lumina.banking.repository.WalletRepository;
import com.lumina.banking.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public WalletResponse getWalletByUserId(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        return mapToWalletResponse(wallet);
    }

    @Override
    @Transactional
    public TransactionResponse addMoney(String userId, AddMoneyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("User account is inactive or suspended");
        }

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        // Increase wallet balance
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        // Record Transaction
        String ref = "DEP-" + LocalDateTime.now().getYear() + "-" + (100000 + new Random().nextInt(900000));

        Transaction txn = Transaction.builder()
                .transactionReference(ref)
                .senderWallet(null) // External gateway deposit
                .receiverWallet(wallet)
                .senderName(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Direct Deposit")
                .receiverName(user.getFullName())
                .senderEmail("deposit@lumina.bank")
                .receiverEmail(user.getEmail())
                .amount(request.getAmount())
                .transactionType(TransactionType.ADD_MONEY)
                .transactionStatus(TransactionStatus.SUCCESS)
                .description(request.getDescription() != null ? request.getDescription() : "Funds Added")
                .build();

        Transaction savedTxn = transactionRepository.save(txn);
        return mapToTransactionResponse(savedTxn);
    }

    /**
     * ATOMIC MONEY TRANSFER
     * ACID Guarantee with Isolation.REPEATABLE_READ and automatic rollback on exception.
     */
    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class)
    public TransactionResponse transferMoney(String senderUserId, TransferRequest request) {
        // 1. Verify Sender
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found"));

        if (sender.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Your account is suspended or inactive");
        }

        Wallet senderWallet = walletRepository.findByUserId(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender wallet not found"));

        // 2. Validate Amount
        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Transfer amount must be strictly greater than $0.00");
        }

        // 3. Check Balance
        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient wallet funds. Current balance: $" + senderWallet.getBalance());
        }

        // 4. Find Recipient Wallet (by wallet number, email, or phone)
        String query = request.getReceiverIdentifier().trim();
        Wallet receiverWallet = walletRepository.findByWalletNumber(query)
                .or(() -> walletRepository.findByUserEmail(query))
                .or(() -> walletRepository.findByUserPhone(query))
                .orElseThrow(() -> new ResourceNotFoundException("Recipient account not found for identifier: " + query));

        User receiver = receiverWallet.getUser();
        if (receiver.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Recipient account is suspended or deactivated");
        }

        // 5. Prevent Self Transfer
        if (senderWallet.getId().equals(receiverWallet.getId())) {
            throw new BadRequestException("Transfers to your own wallet are not permitted");
        }

        // 6. Execute atomic deduction and addition
        senderWallet.setBalance(senderWallet.getBalance().subtract(amount));
        receiverWallet.setBalance(receiverWallet.getBalance().add(amount));

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // 7. Record Transaction
        String ref = "TXN-" + LocalDateTime.now().getYear() + "-" + (100000 + new Random().nextInt(900000));

        Transaction txn = Transaction.builder()
                .transactionReference(ref)
                .senderWallet(senderWallet)
                .receiverWallet(receiverWallet)
                .senderName(sender.getFullName())
                .receiverName(receiver.getFullName())
                .senderEmail(sender.getEmail())
                .receiverEmail(receiver.getEmail())
                .amount(amount)
                .transactionType(TransactionType.TRANSFER_SENT)
                .transactionStatus(TransactionStatus.SUCCESS)
                .description(request.getDescription() != null ? request.getDescription() : "Money Transfer")
                .build();

        Transaction savedTxn = transactionRepository.save(txn);
        return mapToTransactionResponse(savedTxn);
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
