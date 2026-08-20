package com.lumina.banking.repository;

import com.lumina.banking.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, String> {
    Optional<Wallet> findByWalletNumber(String walletNumber);
    Optional<Wallet> findByUserId(String userId);

    @Query("SELECT w FROM Wallet w JOIN w.user u WHERE u.email = :email")
    Optional<Wallet> findByUserEmail(@Param("email") String email);

    @Query("SELECT w FROM Wallet w JOIN w.user u WHERE u.phone = :phone")
    Optional<Wallet> findByUserPhone(@Param("phone") String phone);

    boolean existsByWalletNumber(String walletNumber);
}
