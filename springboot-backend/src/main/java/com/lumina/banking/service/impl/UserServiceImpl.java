package com.lumina.banking.service.impl;

import com.lumina.banking.dto.response.UserResponse;
import com.lumina.banking.entity.User;
import com.lumina.banking.entity.UserStatus;
import com.lumina.banking.entity.Wallet;
import com.lumina.banking.exception.ResourceNotFoundException;
import com.lumina.banking.repository.UserRepository;
import com.lumina.banking.repository.WalletRepository;
import com.lumina.banking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);

        return mapToUserResponse(user, wallet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
            return mapToUserResponse(user, wallet);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE);
        User updatedUser = userRepository.save(user);
        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);

        return mapToUserResponse(updatedUser, wallet);
    }

    private UserResponse mapToUserResponse(User user, Wallet wallet) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .walletNumber(wallet != null ? wallet.getWalletNumber() : null)
                .balance(wallet != null ? wallet.getBalance().doubleValue() : 0.0)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
