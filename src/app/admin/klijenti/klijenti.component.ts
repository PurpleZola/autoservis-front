import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { KlijentiService } from '../../services/klijenti.service';
import { Klijent } from '../../models/klijent.model';
import { KlijentDialogComponent, KlijentDialogData } from './klijent-dialog/klijent-dialog.component';

@Component({
  selector: 'app-klijenti',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './klijenti.component.html',
  styleUrl: './klijenti.component.scss'
})
export class KlijentiComponent implements OnInit {
  private readonly klijentiService = inject(KlijentiService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['id', 'ime', 'prezime', 'telefon', 'adresa', 'actions'];
  readonly klijenti = signal<Klijent[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadKlijenti();
  }

  loadKlijenti(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.klijentiService.getAll().subscribe({
      next: (data) => {
        this.klijenti.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja klijenata.');
      }
    });
  }

  openDialog(klijent?: Klijent): void {
    const dialogRef = this.dialog.open<KlijentDialogComponent, KlijentDialogData, Klijent>(
      KlijentDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { klijent: klijent ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const request = result.id
        ? this.klijentiService.update(result.id, result)
        : this.klijentiService.create(result);

      request.subscribe({
        next: () => this.loadKlijenti(),
        error: () => this.errorMessage.set('Greška prilikom čuvanja klijenta.')
      });
    });
  }

  deleteKlijent(klijent: Klijent): void {
    if (!klijent.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati klijenta ${klijent.ime} ${klijent.prezime}?`);
    if (!potvrda) {
      return;
    }

    this.klijentiService.delete(klijent.id).subscribe({
      next: () => this.klijenti.update((list) => list.filter((k) => k.id !== klijent.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja klijenta.')
    });
  }
}
