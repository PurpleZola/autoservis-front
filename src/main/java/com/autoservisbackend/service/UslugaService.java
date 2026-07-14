package com.autoservisbackend.service;

import com.autoservisbackend.entity.Usluga;
import com.autoservisbackend.repository.UslugaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UslugaService {

    private final UslugaRepository uslugaRepository;

    public List<Usluga> getAll() {
        return uslugaRepository.findAll();
    }

    public Optional<Usluga> getById(Long id) {
        return uslugaRepository.findById(id);
    }

    public Usluga save(Usluga usluga) {
        return uslugaRepository.save(usluga);
    }

    public void delete(Long id) {
        uslugaRepository.deleteById(id);
    }
}