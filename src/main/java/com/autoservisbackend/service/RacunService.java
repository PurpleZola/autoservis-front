package com.autoservisbackend.service;

import com.autoservisbackend.entity.Racun;
import com.autoservisbackend.repository.RacunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RacunService {

    private final RacunRepository racunRepository;

    public List<Racun> getAll() {
        return racunRepository.findAll();
    }

    public Optional<Racun> getById(Long id) {
        return racunRepository.findById(id);
    }

    public Racun save(Racun racun) {
        return racunRepository.save(racun);
    }

    public void delete(Long id) {
        racunRepository.deleteById(id);
    }
}