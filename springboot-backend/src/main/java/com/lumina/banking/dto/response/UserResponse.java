package com.lumina.banking.dto.response;

import com.lumina.banking.entity.Role;
import com.lumina.banking.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private String walletNumber;
    private Double balance;
    private LocalDateTime createdAt;
}
