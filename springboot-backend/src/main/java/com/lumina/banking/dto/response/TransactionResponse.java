package com.lumina.banking.dto.response;

import com.lumina.banking.entity.TransactionStatus;
import com.lumina.banking.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private String id;
    private String transactionReference;
    private String senderWalletId;
    private String receiverWalletId;
    private String senderName;
    private String receiverName;
    private String senderEmail;
    private String receiverEmail;
    private BigDecimal amount;
    private TransactionType transactionType;
    private TransactionStatus transactionStatus;
    private String description;
    private LocalDateTime createdAt;
}
