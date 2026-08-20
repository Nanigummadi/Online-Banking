package com.lumina.banking.service.impl;

import com.lumina.banking.dto.request.LoginRequest;
import com.lumina.banking.dto.request.RegisterRequest;
import com.lumina.banking.dto.response.AuthResponse;
import com.lumina.banking.dto.response.UserResponse;
import com.lumina.banking.dto.response.WalletResponse;
import com.lumina.banking.entity.Role;
import com.lumina.banking.entity.User;
import com.lumina.banking.entity.UserStatus;
import com.lumina.banking.entity.Wallet;
import com.lumina.banking.exception.BadRequestException;
import com.lumina.banking.repository.UserRepository;
import com.lumina.banking.repository.WalletRepository;
import com.lumina.banking.security.JwtTokenProvider;
import com.lumina.banking.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Account is currently suspended/inactive");
        }

        String token = tokenProvider.generateToken(authentication);
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(user, wallet))
                .wallet(wallet != null ? mapToWalletResponse(wallet) : null)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        // 1. Create User
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        // 2. Generate unique 10-digit Wallet Number
        String walletNum = "WAL-" + (1000000000L + (long)(new Random().nextDouble() * 9000000000L));
        while (walletRepository.existsByWalletNumber(walletNum)) {
            walletNum = "WAL-" + (1000000000L + (long)(new Random().nextDouble() * 9000000000L));
        }

        Wallet wallet = Wallet.builder()
                .walletNumber(walletNum)
                .balance(BigDecimal.ZERO)
                .user(savedUser)
                .build();

        Wallet savedWallet = walletRepository.save(wallet);

        // 3. Generate JWT
        String token = tokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(savedUser, savedWallet))
                .wallet(mapToWalletResponse(savedWallet))
                .build();
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
}
