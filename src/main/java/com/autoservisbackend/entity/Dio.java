package com.autoservisbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "dio")
public class Dio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String naziv;

    @Column(nullable = false)
    private Double cijena;

    private int kolicinaNaStanju;

    private int minimalnaKolicina;

    @ManyToOne
    @JoinColumn(name = "servisni_nalog_id")
    private ServisniNalog servisniNalog;
}