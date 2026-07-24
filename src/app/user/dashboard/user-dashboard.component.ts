import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CurrentKlijentService } from '../../services/current-klijent.service';
import { VozilaService } from '../../services/vozila.service';
import { ServisniNaloziService } from '../../services/servisni-nalozi.service';

import { Vozilo } from '../../models/vozilo.model';
import { ServisniNalog } from '../../models/servisni-nalog.model';

interface ServisReminder {
  vozilo: Vozilo;
  sledeciServisDatum: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  private readonly currentKlijentService = inject(CurrentKlijentService);
  private readonly vozilaService = inject(VozilaService);
  private readonly servisniNaloziService = inject(ServisniNaloziService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly noKlijentPovezan = signal(false);

  private readonly vozila = signal<Vozilo[]>([]);
  private readonly servisniNalozi = signal<ServisniNalog[]>([]);

  readonly vozilaCount = computed(() => this.vozila().length);

  readonly aktivniNaloziCount = computed(
    () => this.servisniNalozi().filter((nalog) => nalog.status !== 'ZAVRSEN').length
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

    this.currentKlijentService
      .getCurrentKlijent()
      .pipe(
        switchMap((klijent) => {
          if (!klijent?.id) {
            this.noKlijentPovezan.set(true);
            return of({ vozila: [] as Vozilo[], servisniNalozi: [] as ServisniNalog[] });
          }

          const klijentId = klijent.id;

          return this.vozilaService.getAll().pipe(
            switchMap((sveVozila) => {
              const mojaVozila = sveVozila.filter((v) => v.klijentId === klijentId);
              const mojiVoziloIds = new Set(mojaVozila.map((v) => v.id));

              return this.servisniNaloziService.getAll().pipe(
                catchError(() => of<ServisniNalog[]>([])),
                switchMap((sviNalozi) =>
                  of({
                    vozila: mojaVozila,
                    servisniNalozi: sviNalozi.filter((n) => mojiVoziloIds.has(n.voziloId))
                  })
                )
              );
            }),
            catchError(() => of({ vozila: [] as Vozilo[], servisniNalozi: [] as ServisniNalog[] }))
          );
        })
      )
      .subscribe({
        next: (result) => {
          this.vozila.set(result.vozila);
          this.servisniNalozi.set(result.servisniNalozi);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Greška prilikom učitavanja dashboard podataka:', err.status, err.error ?? err.message);
          this.loading.set(false);
          this.errorMessage.set('Greška prilikom učitavanja podataka.');
        }
      });
  }
}
