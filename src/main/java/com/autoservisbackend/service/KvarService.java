package com.autoservisbackend.service;

import com.autoservisbackend.entity.Kvar;
import com.autoservisbackend.repository.KvarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KvarService {

    private final KvarRepository kvarRepository;

    public List<Kvar> getAll() {
        return kvarRepository.findAll();
    }

    public Optional<Kvar> getById(Long id) {
        return kvarRepository.findById(id);
    }

    public Kvar save(Kvar kvar) {
        return kvarRepository.save(kvar);
    }

    public void delete(Long id) {
        kvarRepository.deleteById(id);
    }
}