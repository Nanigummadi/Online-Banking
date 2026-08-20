package com.lumina.banking.service;

import com.lumina.banking.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getCurrentUserProfile(String userId);
    List<UserResponse> getAllUsers();
    UserResponse toggleUserStatus(String userId);
}
