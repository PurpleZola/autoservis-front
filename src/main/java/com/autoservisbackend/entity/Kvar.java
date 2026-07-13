package com.autoservisbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "kvar")
public class Kvar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String naziv;

    private String opis;

    @ManyToOne
    @JoinColumn(name = "servisni_nalog_id")
    private ServisniNalog servisniNalog;
}