import { Component, OnInit, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CurrentKlijentService } from '../../services/current-klijent.service';
import { VozilaService } from '../../services/vozila.service';
import { Vozilo } from '../../models/vozilo.model';

@Component({
  selector: 'app-user-vozila',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-vozila.component.html',
  styleUrl: './user-vozila.component.scss'
})
export class UserVozilaComponent implements OnInit {
  private readonly currentKlijentService = inject(CurrentKlijentService);
  private readonly vozilaService = inject(VozilaService);

  readonly displayedColumns = ['marka', 'model', 'godina', 'registracija', 'boja', 'gorivo', 'kilometraza'];
  readonly vozila = signal<Vozilo[]>([]);
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
            return of<Vozilo[]>([]);
          }

          const klijentId = klijent.id;
          return this.vozilaService.getAll().pipe(
            switchMap((sva) => of(sva.filter((v) => v.klijentId === klijentId)))
          );
        })
      )
      .subscribe({
        next: (data) => {
          this.vozila.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Greška prilikom učitavanja vozila:', err.status, err.error ?? err.message);
          this.loading.set(false);
          this.errorMessage.set('Greška prilikom učitavanja vozila.');
        }
      });
  }
}
