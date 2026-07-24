import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CurrentKlijentService } from '../../services/current-klijent.service';
import { VozilaService } from '../../services/vozila.service';
import { ServisniNaloziService } from '../../services/servisni-nalozi.service';
import { RacuniService } from '../../services/racuni.service';
import { Racun } from '../../models/racun.model';

@Component({
  selector: 'app-user-racuni',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-racuni.component.html',
  styleUrl: './user-racuni.component.scss'
})
export class UserRacuniComponent implements OnInit {
  private readonly currentKlijentService = inject(CurrentKlijentService);
  private readonly vozilaService = inject(VozilaService);
  private readonly servisniNaloziService = inject(ServisniNaloziService);
  private readonly racuniService = inject(RacuniService);

  readonly displayedColumns = ['datum', 'ukupnaCijena', 'napomena'];
  readonly racuni = signal<Racun[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.currentKlijentService
      .getCurrentKlijent()
      .pipe(
        switchMap((klijent) => {
          if (!klijent?.id) {
            return of<Racun[]>([]);
          }

          const klijentId = klijent.id;

          return forkJoin({
            vozila: this.vozilaService.getAll(),
            servisniNalozi: this.servisniNaloziService.getAll(),
            racuni: this.racuniService.getAll()
          }).pipe(
            switchMap(({ vozila, servisniNalozi, racuni }) => {
              const mojiVoziloIds = new Set(vozila.filter((v) => v.klijentId === klijentId).map((v) => v.id));
              const mojiNalogIds = new Set(
                servisniNalozi.filter((n) => mojiVoziloIds.has(n.voziloId)).map((n) => n.id)
              );

              return of(racuni.filter((r) => mojiNalogIds.has(r.servisniNalogId)));
            })
          );
        })
      )
      .subscribe({
        next: (data) => {
          this.racuni.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Greška prilikom učitavanja računa:', err.status, err.error ?? err.message);
          this.loading.set(false);
          this.errorMessage.set('Greška prilikom učitavanja računa.');
        }
      });
  }
}
