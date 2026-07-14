package com.autoservisbackend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String lozinka;
}
