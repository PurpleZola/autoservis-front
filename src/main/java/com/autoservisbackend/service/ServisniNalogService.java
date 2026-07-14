package com.autoservisbackend.service;

import com.autoservisbackend.entity.ServisniNalog;
import com.autoservisbackend.repository.ServisniNalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServisniNalogService {

    private final ServisniNalogRepository servisniNalogRepository;

    public List<ServisniNalog> getAll() {
        return servisniNalogRepository.findAll();
    }

    public Optional<ServisniNalog> getById(Long id) {
        return servisniNalogRepository.findById(id);
    }

    public ServisniNalog save(ServisniNalog servisniNalog) {
        return servisniNalogRepository.save(servisniNalog);
    }

    public void delete(Long id) {
        servisniNalogRepository.deleteById(id);
    }
}