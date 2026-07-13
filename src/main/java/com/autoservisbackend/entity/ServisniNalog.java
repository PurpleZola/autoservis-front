package com.autoservisbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "servisni_nalog")
public class ServisniNalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate datumPrijema;

    private LocalDate datumZavrsetka;

    private String opisProblema;

    @Column(nullable = false)
    private String status;

    private LocalDate sledeciServisDatum;

    @ManyToOne
    @JoinColumn(name = "vozilo_id")
    private Vozilo vozilo;

    @ManyToOne
    @JoinColumn(name = "serviser_id")
    private Serviser serviser;
}