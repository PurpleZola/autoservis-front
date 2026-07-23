import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { KvaroviService } from '../../services/kvarovi.service';
import { Kvar } from '../../models/kvar.model';
import { KvarDialogComponent, KvarDialogData } from './kvar-dialog/kvar-dialog.component';

@Component({
  selector: 'app-kvarovi',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './kvarovi.component.html',
  styleUrl: './kvarovi.component.scss'
})
export class KvaroviComponent implements OnInit {
  private readonly kvaroviService = inject(KvaroviService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['id', 'naziv', 'opis', 'servisniNalogId', 'actions'];
  readonly kvarovi = signal<Kvar[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadKvarovi();
  }

  loadKvarovi(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.kvaroviService.getAll().subscribe({
      next: (data) => {
        this.kvarovi.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja kvarova.');
      }
    });
  }

  openDialog(kvar?: Kvar): void {
    const dialogRef = this.dialog.open<KvarDialogComponent, KvarDialogData, Kvar>(
      KvarDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { kvar: kvar ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const request = result.id
        ? this.kvaroviService.update(result.id, result)
        : this.kvaroviService.create(result);

      request.subscribe({
        next: () => this.loadKvarovi(),
        error: (err) => {
          this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom čuvanja kvara.');
        }
      });
    });
  }

  deleteKvar(kvar: Kvar): void {
    if (!kvar.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati kvar "${kvar.naziv}"?`);
    if (!potvrda) {
      return;
    }

    this.kvaroviService.delete(kvar.id).subscribe({
      next: () => this.kvarovi.update((list) => list.filter((k) => k.id !== kvar.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja kvara.')
    });
  }
}
