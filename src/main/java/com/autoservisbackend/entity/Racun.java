package com.autoservisbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "racun")
public class Racun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate datum;

    @Column(nullable = false)
    private Double ukupnaCijena;

    private String napomena;

    @OneToOne
    @JoinColumn(name = "servisni_nalog_id")
    private ServisniNalog servisniNalog;
}