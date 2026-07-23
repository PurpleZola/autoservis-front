import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UslugeService } from '../../services/usluge.service';
import { Usluga } from '../../models/usluga.model';
import { UslugaDialogComponent, UslugaDialogData } from './usluga-dialog/usluga-dialog.component';

@Component({
  selector: 'app-usluge',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usluge.component.html',
  styleUrl: './usluge.component.scss'
})
export class UslugeComponent implements OnInit {
  private readonly uslugeService = inject(UslugeService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['id', 'naziv', 'cijena', 'servisniNalogId', 'actions'];
  readonly usluge = signal<Usluga[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsluge();
  }

  loadUsluge(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.uslugeService.getAll().subscribe({
      next: (data) => {
        this.usluge.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja usluga.');
      }
    });
  }

  openDialog(usluga?: Usluga): void {
    const dialogRef = this.dialog.open<UslugaDialogComponent, UslugaDialogData, Usluga>(
      UslugaDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { usluga: usluga ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const request = result.id
        ? this.uslugeService.update(result.id, result)
        : this.uslugeService.create(result);

      request.subscribe({
        next: () => this.loadUsluge(),
        error: (err) => {
          this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom čuvanja usluge.');
        }
      });
    });
  }

  deleteUsluga(usluga: Usluga): void {
    if (!usluga.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati uslugu "${usluga.naziv}"?`);
    if (!potvrda) {
      return;
    }

    this.uslugeService.delete(usluga.id).subscribe({
      next: () => this.usluge.update((list) => list.filter((u) => u.id !== usluga.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja usluge.')
    });
  }
}
