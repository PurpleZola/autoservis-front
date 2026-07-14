package com.autoservisbackend.security;

import com.autoservisbackend.entity.Korisnik;
import com.autoservisbackend.repository.KorisnikRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final KorisnikRepository korisnikRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Korisnik korisnik = korisnikRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Korisnik nije pronađen: " + email));

        return new User(
                korisnik.getEmail(),
                korisnik.getLozinka(),
                List.of(new SimpleGrantedAuthority("ROLE_" + korisnik.getRola()))
        );
    }
}
