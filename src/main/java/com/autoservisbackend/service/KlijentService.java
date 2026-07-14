package com.autoservisbackend.service;

import com.autoservisbackend.entity.Klijent;
import com.autoservisbackend.repository.KlijentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KlijentService {

    private final KlijentRepository klijentRepository;

    public List<Klijent> getAll() {
        return klijentRepository.findAll();
    }

    public Optional<Klijent> getById(Long id) {
        return klijentRepository.findById(id);
    }

    public Klijent save(Klijent klijent) {
        return klijentRepository.save(klijent);
    }

    public void delete(Long id) {
        klijentRepository.deleteById(id);
    }
}