package com.lumina.banking.dto.response;

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
public class WalletResponse {
    private String id;
    private String walletNumber;
    private BigDecimal balance;
    private String userId;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;
}
