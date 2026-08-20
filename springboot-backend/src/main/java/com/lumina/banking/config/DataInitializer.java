package com.lumina.banking.config;

import com.lumina.banking.entity.*;
import com.lumina.banking.repository.TransactionRepository;
import com.lumina.banking.repository.UserRepository;
import com.lumina.banking.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial administrator and demo customer accounts...");

            // 1. Create System Admin
            User admin = User.builder()
                    .fullName("Banking System Administrator")
                    .email("admin@lumina.bank")
                    .phone("+18005550199")
                    .password(passwordEncoder.encode("Admin@123456"))
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            User savedAdmin = userRepository.save(admin);

            Wallet adminWallet = Wallet.builder()
                    .walletNumber("WAL-9990001111")
                    .balance(new BigDecimal("1000000.00"))
                    .user(savedAdmin)
                    .build();
            walletRepository.save(adminWallet);

            // 2. Create Demo Customer 1 (Alice Johnson)
            User alice = User.builder()
                    .fullName("Alice Johnson")
                    .email("alice@lumina.bank")
                    .phone("+18005550101")
                    .password(passwordEncoder.encode("Password@123"))
                    .role(Role.USER)
                    .status(UserStatus.ACTIVE)
                    .build();
            User savedAlice = userRepository.save(alice);

            Wallet aliceWallet = Wallet.builder()
                    .walletNumber("WAL-1002003001")
                    .balance(new BigDecimal("5450.00"))
                    .user(savedAlice)
                    .build();
            Wallet savedAliceWallet = walletRepository.save(aliceWallet);

            // 3. Create Demo Customer 2 (Bob Martinez)
            User bob = User.builder()
                    .fullName("Bob Martinez")
                    .email("bob@lumina.bank")
                    .phone("+18005550102")
                    .password(passwordEncoder.encode("Password@123"))
                    .role(Role.USER)
                    .status(UserStatus.ACTIVE)
                    .build();
            User savedBob = userRepository.save(bob);

            Wallet bobWallet = Wallet.builder()
                    .walletNumber("WAL-1002003002")
                    .balance(new BigDecimal("1820.50"))
                    .user(savedBob)
                    .build();
            Wallet savedBobWallet = walletRepository.save(bobWallet);

            // 4. Seed sample transaction
            Transaction sampleTxn = Transaction.builder()
                    .transactionReference("TXN-" + LocalDateTime.now().getYear() + "-100001")
                    .senderWallet(savedAliceWallet)
                    .receiverWallet(savedBobWallet)
                    .senderName(savedAlice.getFullName())
                    .receiverName(savedBob.getFullName())
                    .senderEmail(savedAlice.getEmail())
                    .receiverEmail(savedBob.getEmail())
                    .amount(new BigDecimal("250.00"))
                    .transactionType(TransactionType.TRANSFER_SENT)
                    .transactionStatus(TransactionStatus.SUCCESS)
                    .description("Dinner & shared expenses")
                    .build();
            transactionRepository.save(sampleTxn);

            log.info("Database initialized successfully with default admin and demo customer credentials.");
        }
    }
}
