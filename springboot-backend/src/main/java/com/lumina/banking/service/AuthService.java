package com.lumina.banking.service;

import com.lumina.banking.dto.request.LoginRequest;
import com.lumina.banking.dto.request.RegisterRequest;
import com.lumina.banking.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
