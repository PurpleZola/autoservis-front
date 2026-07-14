package com.autoservisbackend.controller;

import com.autoservisbackend.dto.LoginRequest;
import com.autoservisbackend.dto.RegisterRequest;
import com.autoservisbackend.entity.Korisnik;
import com.autoservisbackend.repository.KorisnikRepository;
import com.autoservisbackend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final KorisnikRepository korisnikRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getLozinka())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("greska", "Pogrešan email ili lozinka"));
        }

        String token = jwtUtil.generateToken(request.getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (korisnikRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("greska", "Email je već zauzet"));
        }

        Korisnik korisnik = new Korisnik();
        korisnik.setEmail(request.getEmail());
        korisnik.setLozinka(passwordEncoder.encode(request.getLozinka()));
        korisnik.setRola("USER");
        korisnikRepository.save(korisnik);

        String token = jwtUtil.generateToken(request.getEmail());
        return ResponseEntity.status(201).body(Map.of("token", token));
    }
}
