import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ServiseriService } from '../../services/serviseri.service';
import { Serviser } from '../../models/serviser.model';
import { ServiserDialogComponent, ServiserDialogData } from './serviser-dialog/serviser-dialog.component';

@Component({
  selector: 'app-serviseri',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './serviseri.component.html',
  styleUrl: './serviseri.component.scss'
})
export class ServiseriComponent implements OnInit {
  private readonly serviseriService = inject(ServiseriService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['id', 'ime', 'prezime', 'specijalnost', 'telefon', 'actions'];
  readonly serviseri = signal<Serviser[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadServiseri();
  }

  loadServiseri(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.serviseriService.getAll().subscribe({
      next: (data) => {
        this.serviseri.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja servisera.');
      }
    });
  }

  openDialog(serviser?: Serviser): void {
    const dialogRef = this.dialog.open<ServiserDialogComponent, ServiserDialogData, Serviser>(
      ServiserDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { serviser: serviser ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const request = result.id
        ? this.serviseriService.update(result.id, result)
        : this.serviseriService.create(result);

      request.subscribe({
        next: () => this.loadServiseri(),
        error: (err) => {
          this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom čuvanja servisera.');
        }
      });
    });
  }

  deleteServiser(serviser: Serviser): void {
    if (!serviser.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati servisera ${serviser.ime} ${serviser.prezime}?`);
    if (!potvrda) {
      return;
    }

    this.serviseriService.delete(serviser.id).subscribe({
      next: () => this.serviseri.update((list) => list.filter((s) => s.id !== serviser.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja servisera.')
    });
  }
}
