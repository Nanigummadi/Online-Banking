import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Database, 
  ShieldCheck, 
  Server, 
  Cloud, 
  FileCode, 
  Copy, 
  Check, 
  Terminal,
  Cpu,
  BookOpen
} from 'lucide-react';

interface SpringDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpringDocsModal: React.FC<SpringDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ARCH' | 'ER' | 'DEPLOY' | 'JAVA_CODE'>('ARCH');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const mysqlSchemaSql = `-- ===================================================
-- MySQL 8.x Production DDL Schema for Digital Wallet
-- ===================================================

CREATE DATABASE IF NOT EXISTS digital_wallet_db;
USE digital_wallet_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- BCrypt Hash
    role ENUM('USER', 'ADMIN') DEFAULT 'USER' NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_user_email (email),
    INDEX idx_user_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Wallets Table (1:1 with Users)
CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(64) PRIMARY KEY,
    wallet_number VARCHAR(30) NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    user_id VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallet_number (wallet_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Transactions Table (1:Many with Wallets)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    transaction_reference VARCHAR(50) NOT NULL UNIQUE,
    sender_wallet_id VARCHAR(64) NULL,
    receiver_wallet_id VARCHAR(64) NOT NULL,
    sender_name VARCHAR(100) NULL,
    receiver_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(100) NULL,
    receiver_email VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    transaction_type ENUM('ADD_MONEY', 'TRANSFER_SENT', 'TRANSFER_RECEIVED') NOT NULL,
    transaction_status ENUM('SUCCESS', 'FAILED') DEFAULT 'SUCCESS' NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_txn_sender_wallet FOREIGN KEY (sender_wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    CONSTRAINT fk_txn_receiver_wallet FOREIGN KEY (receiver_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_txn_reference (transaction_reference),
    INDEX idx_txn_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const springTransferServiceCode = `package com.example.digitalwallet.service.impl;

import com.example.digitalwallet.entity.*;
import com.example.digitalwallet.repository.*;
import com.example.digitalwallet.exception.*;
import com.example.digitalwallet.dto.request.TransferRequest;
import com.example.digitalwallet.dto.response.TransactionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    /**
     * ATOMIC MONEY TRANSFER IMPLEMENTATION
     * Guarantees ACID properties: If any check fails, changes roll back immediately.
     */
    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class)
    public TransactionResponse transferMoney(String senderUserId, TransferRequest request) {
        // 1. Verify Sender
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));
        if (sender.getStatus() != UserStatus.ACTIVE) {
            throw new AccountDeactivatedException("Your account is deactivated");
        }

        Wallet senderWallet = walletRepository.findByUserId(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender wallet not found"));

        // 2. Validate Amount
        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Transfer amount must be strictly greater than $0.00");
        }

        // 3. Verify Receiver (lookup by Wallet Number, Email, or Phone)
        Wallet receiverWallet = walletRepository.findByWalletNumber(request.getReceiverIdentifier())
                .or(() -> walletRepository.findByUserEmail(request.getReceiverIdentifier()))
                .or(() -> walletRepository.findByUserPhone(request.getReceiverIdentifier()))
                .orElseThrow(() -> new ResourceNotFoundException("Recipient account not found"));

        User receiver = receiverWallet.getUser();
        if (receiver.getStatus() != UserStatus.ACTIVE) {
            throw new AccountDeactivatedException("Recipient account is deactivated");
        }

        // 4. Verify Not Self-Transfer
        if (senderWallet.getId().equals(receiverWallet.getId())) {
            throw new SelfTransferException("Self-transfer to your own wallet is not permitted");
        }

        // 5. Check Sufficient Balance
        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient wallet balance for this transfer");
        }

        // 6. Deduct from Sender & Add to Receiver
        senderWallet.setBalance(senderWallet.getBalance().subtract(amount));
        receiverWallet.setBalance(receiverWallet.getBalance().add(amount));

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // 7. Record Transaction
        String txnRef = "TXN-" + LocalDateTime.now().getYear() + "-" + (int)(100000 + Math.random() * 900000);

        Transaction transaction = Transaction.builder()
                .transactionReference(txnRef)
                .senderWallet(senderWallet)
                .receiverWallet(receiverWallet)
                .senderName(sender.getFullName())
                .receiverName(receiver.getFullName())
                .senderEmail(sender.getEmail())
                .receiverEmail(receiver.getEmail())
                .amount(amount)
                .transactionType(TransactionType.TRANSFER_SENT)
                .transactionStatus(TransactionStatus.SUCCESS)
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();

        Transaction savedTxn = transactionRepository.save(transaction);
        return mapToTransactionResponse(savedTxn);
    }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">System Architecture & Spring Boot 3 Specs</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                  Java 17 • Spring Boot 3.x
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Architectural blueprint, MySQL ER schema, @Transactional money transfer logic & Cloud Run deployment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 bg-slate-50 flex space-x-2 shrink-0">
          {[
            { id: 'ARCH', label: 'Layered Architecture', icon: Server },
            { id: 'ER', label: 'MySQL ER Schema & DDL', icon: Database },
            { id: 'JAVA_CODE', label: 'Spring @Transactional Service', icon: FileCode },
            { id: 'DEPLOY', label: 'GCP Cloud Run & MySQL Deploy', icon: Cloud },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
          {activeTab === 'ARCH' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm">
                    <Server className="w-4 h-4" />
                    <span>Presentation / REST</span>
                  </div>
                  <p className="text-slate-600">
                    Spring Web REST Controllers (<code>AuthController</code>, <code>WalletController</code>, <code>AdminController</code>) with DTO validation and JSON serialization.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm">
                    <Cpu className="w-4 h-4" />
                    <span>Business / Service</span>
                  </div>
                  <p className="text-slate-600">
                    Spring Data JPA Services with strict <code>@Transactional(isolation = Isolation.REPEATABLE_READ)</code> for atomic transfers and rollback prevention.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Security Filter Chain</span>
                  </div>
                  <p className="text-slate-600">
                    Spring Security with Stateless JWT Authentication Filter, BCrypt (strength 10), and Role-Based Access Control (<code>USER</code>, <code>ADMIN</code>).
                  </p>
                </div>
              </div>

              {/* Architecture Directory Tree */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Spring Boot 3 Enterprise Package Structure</span>
                  <span className="text-indigo-600">com.example.digitalwallet</span>
                </div>
                <pre className="text-slate-700 leading-relaxed whitespace-pre">
{`com.example.digitalwallet/
 ├── config/            # SecurityConfig, CorsConfig, SwaggerConfig
 ├── controller/        # AuthController, WalletController, AdminController, UserController
 ├── dto/
 │    ├── request/      # LoginRequest, RegisterRequest, TransferRequest, AddMoneyRequest
 │    └── response/     # ApiResponse, AuthResponse, WalletResponse, TransactionResponse
 ├── entity/            # User, Wallet, Transaction, Role, UserStatus, TransactionType
 ├── exception/         # GlobalExceptionHandler, InsufficientBalanceException, CustomException
 ├── repository/        # UserRepository, WalletRepository, TransactionRepository
 ├── security/          # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
 ├── service/           # AuthService, WalletService, TransactionService, AdminService
 └── DigitalWalletApplication.java`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'ER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">MySQL 8.x Relational DDL & Constraints</h4>
                <button
                  onClick={() => copyToClipboard(mysqlSchemaSql, 'ddl')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 border border-slate-200 transition"
                >
                  {copiedCode === 'ddl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'ddl' ? 'Copied DDL!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] overflow-x-auto text-slate-800">
                <pre>{mysqlSchemaSql}</pre>
              </div>
            </div>
          )}

          {activeTab === 'JAVA_CODE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Spring Boot 3 @Transactional Money Transfer Service</h4>
                <button
                  onClick={() => copyToClipboard(springTransferServiceCode, 'service')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 border border-slate-200 transition"
                >
                  {copiedCode === 'service' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'service' ? 'Copied Java!' : 'Copy Java Service'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] overflow-x-auto text-slate-800">
                <pre>{springTransferServiceCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'DEPLOY' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  <span>Google Cloud Platform (GCP) Deployment Strategy</span>
                </h4>
                <p className="text-slate-600">
                  Follow these enterprise steps to deploy the Spring Boot backend to <strong>Google Cloud Run</strong> and provision <strong>Google Cloud SQL for MySQL</strong>:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 text-xs mb-1">Step 1: Provision Google Cloud SQL (MySQL 8)</p>
                    <code className="text-[11px] font-mono text-indigo-600 block">
                      gcloud sql instances create digital-wallet-mysql --database-version=MYSQL_8_0 --tier=db-f1-micro --region=us-central1
                    </code>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 text-xs mb-1">Step 2: Build & Deploy Spring Boot to Cloud Run</p>
                    <code className="text-[11px] font-mono text-indigo-600 block whitespace-pre-wrap">
                      gcloud builds submit --tag gcr.io/$PROJECT_ID/digital-wallet-backend<br/>
                      gcloud run deploy digital-wallet-backend --image gcr.io/$PROJECT_ID/digital-wallet-backend --platform managed --region us-central1 --allow-unauthenticated --add-cloudsql-instances $PROJECT_ID:us-central1:digital-wallet-mysql
                    </code>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 text-xs mb-1">Step 3: Deploy Frontend to Firebase Hosting</p>
                    <code className="text-[11px] font-mono text-indigo-600 block">
                      npm run build && firebase deploy --only hosting
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
