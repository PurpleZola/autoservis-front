package com.autoservisbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "vozilo")
public class Vozilo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String marka;

    @Column(nullable = false)
    private String model;

    @Column
    private int godina;

    @Column(unique = true)
    private String registracija;


    private String boja;

    @Column(unique = true)
    private String brojSasije;

    private String gorivo;

    private int kilometraza;

    @ManyToOne
    @JoinColumn(name = "klijent_id")
    private Klijent klijent;
}