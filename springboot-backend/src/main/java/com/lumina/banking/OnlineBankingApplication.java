package com.lumina.banking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class OnlineBankingApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineBankingApplication.class, args);
        System.out.println("==================================================");
        System.out.println("  Online Banking & Digital Wallet Backend Started ");
        System.out.println("  Port: 8080 | Swagger: http://localhost:8080/swagger-ui.html");
        System.out.println("==================================================");
    }
}
