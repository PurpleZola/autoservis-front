import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RacuniService } from '../../services/racuni.service';
import { Racun } from '../../models/racun.model';
import { RacunDialogComponent, RacunDialogData } from './racun-dialog/racun-dialog.component';

@Component({
  selector: 'app-racuni',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './racuni.component.html',
  styleUrl: './racuni.component.scss'
})
export class RacuniComponent implements OnInit {
  private readonly racuniService = inject(RacuniService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['id', 'datum', 'ukupnaCijena', 'napomena', 'servisniNalogId', 'actions'];
  readonly racuni = signal<Racun[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRacuni();
  }

  loadRacuni(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.racuniService.getAll().subscribe({
      next: (data) => {
        this.racuni.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja računa.');
      }
    });
  }

  openDialog(racun?: Racun): void {
    const dialogRef = this.dialog.open<RacunDialogComponent, RacunDialogData, Racun>(
      RacunDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { racun: racun ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const request = result.id
        ? this.racuniService.update(result.id, result)
        : this.racuniService.create(result);

      request.subscribe({
        next: () => this.loadRacuni(),
        error: (err) => {
          this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom čuvanja računa.');
        }
      });
    });
  }

  deleteRacun(racun: Racun): void {
    if (!racun.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati račun #${racun.id}?`);
    if (!potvrda) {
      return;
    }

    this.racuniService.delete(racun.id).subscribe({
      next: () => this.racuni.update((list) => list.filter((r) => r.id !== racun.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja računa.')
    });
  }
}
