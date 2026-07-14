package com.autoservisbackend.repository;

import com.autoservisbackend.entity.Serviser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiserRepository extends JpaRepository<Serviser, Long> {
}