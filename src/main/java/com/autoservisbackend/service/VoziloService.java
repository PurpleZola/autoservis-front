package com.autoservisbackend.service;

import com.autoservisbackend.entity.Vozilo;
import com.autoservisbackend.repository.VoziloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VoziloService {

    private final VoziloRepository voziloRepository;

    public List<Vozilo> getAll() {
        return voziloRepository.findAll();
    }

    public Optional<Vozilo> getById(Long id) {
        return voziloRepository.findById(id);
    }

    public Vozilo save(Vozilo vozilo) {
        return voziloRepository.save(vozilo);
    }

    public void delete(Long id) {
        voziloRepository.deleteById(id);
    }
}