package com.autoservisbackend.service;

import com.autoservisbackend.entity.Serviser;
import com.autoservisbackend.repository.ServiserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServiserService {

    private final ServiserRepository serviserRepository;

    public List<Serviser> getAll() {
        return serviserRepository.findAll();
    }

    public Optional<Serviser> getById(Long id) {
        return serviserRepository.findById(id);
    }

    public Serviser save(Serviser serviser) {
        return serviserRepository.save(serviser);
    }

    public void delete(Long id) {
        serviserRepository.deleteById(id);
    }
}