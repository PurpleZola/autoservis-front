import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { KlijentiService } from '../../services/klijenti.service';
import { VozilaService } from '../../services/vozila.service';
import { ServiseriService } from '../../services/serviseri.service';
import { ServisniNaloziService } from '../../services/servisni-nalozi.service';
import { DijeloviService } from '../../services/dijelovi.service';

import { Klijent } from '../../models/klijent.model';
import { Vozilo } from '../../models/vozilo.model';
import { Serviser } from '../../models/serviser.model';
import { ServisniNalog } from '../../models/servisni-nalog.model';
import { Dio } from '../../models/dio.model';

interface ServisReminder {
  vozilo: Vozilo;
  sledeciServisDatum: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly klijentiService = inject(KlijentiService);
  private readonly vozilaService = inject(VozilaService);
  private readonly serviseriService = inject(ServiseriService);
  private readonly servisniNaloziService = inject(ServisniNaloziService);
  private readonly dijeloviService = inject(DijeloviService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly displayedColumns = ['id', 'opisProblema', 'status', 'datumPrijema'];

  private readonly klijenti = signal<Klijent[]>([]);
  private readonly vozila = signal<Vozilo[]>([]);
  private readonly serviseri = signal<Serviser[]>([]);
  private readonly servisniNalozi = signal<ServisniNalog[]>([]);
  private readonly dijelovi = signal<Dio[]>([]);

  readonly klijentiCount = computed(() => this.klijenti().length);
  readonly vozilaCount = computed(() => this.vozila().length);
  readonly serviseriCount = computed(() => this.serviseri().length);
  readonly servisniNaloziCount = computed(() => this.servisniNalozi().length);

  readonly recentServisniNalozi = computed(() =>
    [...this.servisniNalozi()]
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, 5)
  );

  readonly niskoStanjeDijelovi = computed(() =>
    this.dijelovi().filter((dio) => dio.kolicinaNaStanju < dio.minimalnaKolicina)
  );

  readonly podsjetnici = computed<ServisReminder[]>(() => {
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);
    const zaTridesetDana = new Date(danas);
    zaTridesetDana.setDate(zaTridesetDana.getDate() + 30);

    const voziloById = new Map(this.vozila().map((v) => [v.id, v]));

    return this.servisniNalozi()
      .filter((nalog) => !!nalog.sledeciServisDatum)
      .filter((nalog) => {
        const datum = new Date(nalog.sledeciServisDatum!);
        return datum >= danas && datum <= zaTridesetDana;
      })
      .map((nalog) => ({
        vozilo: voziloById.get(nalog.voziloId),
        sledeciServisDatum: nalog.sledeciServisDatum!
      }))
      .filter((podsjetnik): podsjetnik is ServisReminder => !!podsjetnik.vozilo)
      .sort((a, b) => a.sledeciServisDatum.localeCompare(b.sledeciServisDatum));
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    let hasError = false;

    forkJoin({
      klijenti: this.klijentiService.getAll().pipe(
        catchError(() => {
          hasError = true;
          return of<Klijent[]>([]);
        })
      ),
      vozila: this.vozilaService.getAll().pipe(
        catchError(() => {
          hasError = true;
          return of<Vozilo[]>([]);
        })
      ),
      serviseri: this.serviseriService.getAll().pipe(
        catchError(() => {
          hasError = true;
          return of<Serviser[]>([]);
        })
      ),
      servisniNalozi: this.servisniNaloziService.getAll().pipe(
        catchError(() => {
          hasError = true;
          return of<ServisniNalog[]>([]);
        })
      ),
      dijelovi: this.dijeloviService.getAll().pipe(
        catchError(() => {
          hasError = true;
          return of<Dio[]>([]);
        })
      )
    }).subscribe((result) => {
      this.klijenti.set(result.klijenti);
      this.vozila.set(result.vozila);
      this.serviseri.set(result.serviseri);
      this.servisniNalozi.set(result.servisniNalozi);
      this.dijelovi.set(result.dijelovi);
      this.loading.set(false);

      if (hasError) {
        this.errorMessage.set('Neki podaci nisu mogli biti učitani.');
      }
    });
  }
}
