import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';

import { CurrentKlijentService } from '../../services/current-klijent.service';
import { VozilaService } from '../../services/vozila.service';
import { ServisniNaloziService } from '../../services/servisni-nalozi.service';
import { ServiseriService } from '../../services/serviseri.service';
import { KvaroviService } from '../../services/kvarovi.service';
import { UslugeService } from '../../services/usluge.service';
import { DijeloviService } from '../../services/dijelovi.service';
import { RacuniService } from '../../services/racuni.service';

import { Vozilo } from '../../models/vozilo.model';
import { Kvar } from '../../models/kvar.model';
import { Usluga } from '../../models/usluga.model';
import { Dio } from '../../models/dio.model';
import { Racun } from '../../models/racun.model';

interface NalogHistorija {
  id?: number;
  datumPrijema: string;
  datumZavrsetka?: string;
  opisProblema: string;
  status: string;
  sledeciServisDatum?: string;
  serviser: string;
  kvarovi: Kvar[];
  usluge: Usluga[];
  dijelovi: Dio[];
  racun?: Racun;
}

@Component({
  selector: 'app-user-istorija-servisa',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  templateUrl: './user-istorija-servisa.component.html',
  styleUrl: './user-istorija-servisa.component.scss'
})
export class UserIstorijaServisaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly currentKlijentService = inject(CurrentKlijentService);
  private readonly vozilaService = inject(VozilaService);
  private readonly servisniNaloziService = inject(ServisniNaloziService);
  private readonly serviseriService = inject(ServiseriService);
  private readonly kvaroviService = inject(KvaroviService);
  private readonly uslugeService = inject(UslugeService);
  private readonly dijeloviService = inject(DijeloviService);
  private readonly racuniService = inject(RacuniService);

  readonly vozilo = signal<Vozilo | null>(null);
  readonly nalozi = signal<NalogHistorija[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const voziloId = Number(this.route.snapshot.paramMap.get('voziloId'));

    this.loading.set(true);
    this.errorMessage.set(null);

    this.currentKlijentService
      .getCurrentKlijent()
      .pipe(
        switchMap((klijent) => {
          if (!klijent?.id) {
            return of(null);
          }

          const klijentId = klijent.id;

          return forkJoin({
            vozila: this.vozilaService.getAll(),
            servisniNalozi: this.servisniNaloziService.getAll(),
            serviseri: this.serviseriService.getAll(),
            kvarovi: this.kvaroviService.getAll(),
            usluge: this.uslugeService.getAll(),
            dijelovi: this.dijeloviService.getAll(),
            racuni: this.racuniService.getAll()
          }).pipe(
            switchMap(({ vozila, servisniNalozi, serviseri, kvarovi, usluge, dijelovi, racuni }) => {
              const vozilo = vozila.find((v) => v.id === voziloId && v.klijentId === klijentId) ?? null;
              if (!vozilo) {
                return of(null);
              }

              const serviserById = new Map(serviseri.map((s) => [s.id, `${s.ime} ${s.prezime}`]));

              const nalozi = servisniNalozi
                .filter((n) => n.voziloId === voziloId)
                .map((nalog) => ({
                  id: nalog.id,
                  datumPrijema: nalog.datumPrijema,
                  datumZavrsetka: nalog.datumZavrsetka,
                  opisProblema: nalog.opisProblema,
                  status: nalog.status,
                  sledeciServisDatum: nalog.sledeciServisDatum,
                  serviser: serviserById.get(nalog.serviserID) ?? '—',
                  kvarovi: kvarovi.filter((k) => k.servisniNalogId === nalog.id),
                  usluge: usluge.filter((u) => u.servisniNalogId === nalog.id),
                  dijelovi: dijelovi.filter((d) => d.servisniNalogId === nalog.id),
                  racun: racuni.find((r) => r.servisniNalogId === nalog.id)
                }))
                .sort((a, b) => b.datumPrijema.localeCompare(a.datumPrijema));

              return of({ vozilo, nalozi });
            })
          );
        })
      )
      .subscribe({
        next: (result) => {
          if (!result) {
            this.errorMessage.set('Vozilo nije pronađeno.');
            this.loading.set(false);
            return;
          }

          this.vozilo.set(result.vozilo);
          this.nalozi.set(result.nalozi);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Greška prilikom učitavanja istorije servisa:', err.status, err.error ?? err.message);
          this.loading.set(false);
          this.errorMessage.set('Greška prilikom učitavanja istorije servisa.');
        }
      });
  }
}
