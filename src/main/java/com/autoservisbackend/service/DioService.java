package com.autoservisbackend.service;

import com.autoservisbackend.entity.Dio;
import com.autoservisbackend.repository.DioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DioService {

    private final DioRepository dioRepository;

    public List<Dio> getAll() {
        return dioRepository.findAll();
    }

    public Optional<Dio> getById(Long id) {
        return dioRepository.findById(id);
    }

    public Dio save(Dio dio) {
        return dioRepository.save(dio);
    }

    public void delete(Long id) {
        dioRepository.deleteById(id);
    }
}