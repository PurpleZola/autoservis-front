package com.autoservisbackend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String lozinka;
}
