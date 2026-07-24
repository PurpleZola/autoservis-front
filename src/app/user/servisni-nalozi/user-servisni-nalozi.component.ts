import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CurrentKlijentService } from '../../services/current-klijent.service';
import { VozilaService } from '../../services/vozila.service';
import { ServisniNaloziService } from '../../services/servisni-nalozi.service';
import { ServiseriService } from '../../services/serviseri.service';

interface ServisniNalogRow {
  id?: number;
  datumPrijema: string;
  opisProblema: string;
  status: string;
  serviser: string;
}

@Component({
  selector: 'app-user-servisni-nalozi',
  standalone: true,
  imports: [MatTableModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-servisni-nalozi.component.html',
  styleUrl: './user-servisni-nalozi.component.scss'
})
export class UserServisniNaloziComponent implements OnInit {
  private readonly currentKlijentService = inject(CurrentKlijentService);
  private readonly vozilaService = inject(VozilaService);
  private readonly servisniNaloziService = inject(ServisniNaloziService);
  private readonly serviseriService = inject(ServiseriService);

  readonly displayedColumns = ['datumPrijema', 'opisProblema', 'status', 'serviser'];
  readonly redovi = signal<ServisniNalogRow[]>([]);
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
            return of<ServisniNalogRow[]>([]);
          }

          const klijentId = klijent.id;

          return forkJoin({
            vozila: this.vozilaService.getAll(),
            servisniNalozi: this.servisniNaloziService.getAll(),
            serviseri: this.serviseriService.getAll()
          }).pipe(
            switchMap(({ vozila, servisniNalozi, serviseri }) => {
              const mojiVoziloIds = new Set(vozila.filter((v) => v.klijentId === klijentId).map((v) => v.id));
              const serviserById = new Map(serviseri.map((s) => [s.id, `${s.ime} ${s.prezime}`]));

              const redovi = servisniNalozi
                .filter((nalog) => mojiVoziloIds.has(nalog.voziloId))
                .map((nalog) => ({
                  id: nalog.id,
                  datumPrijema: nalog.datumPrijema,
                  opisProblema: nalog.opisProblema,
                  status: nalog.status,
                  serviser: serviserById.get(nalog.serviserID) ?? '—'
                }));

              return of(redovi);
            })
          );
        })
      )
      .subscribe({
        next: (data) => {
          this.redovi.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Greška prilikom učitavanja servisnih naloga:', err.status, err.error ?? err.message);
          this.loading.set(false);
          this.errorMessage.set('Greška prilikom učitavanja servisnih naloga.');
        }
      });
  }
}
