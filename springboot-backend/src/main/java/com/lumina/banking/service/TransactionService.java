package com.lumina.banking.service;

import com.lumina.banking.dto.response.TransactionResponse;

import java.util.List;

public interface TransactionService {
    List<TransactionResponse> getUserTransactions(String userId);
    TransactionResponse getTransactionByReference(String reference);
}
