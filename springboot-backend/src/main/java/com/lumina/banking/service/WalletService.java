package com.lumina.banking.service;

import com.lumina.banking.dto.request.AddMoneyRequest;
import com.lumina.banking.dto.request.TransferRequest;
import com.lumina.banking.dto.response.TransactionResponse;
import com.lumina.banking.dto.response.WalletResponse;

public interface WalletService {
    WalletResponse getWalletByUserId(String userId);
    TransactionResponse addMoney(String userId, AddMoneyRequest request);
    TransactionResponse transferMoney(String senderUserId, TransferRequest request);
}
