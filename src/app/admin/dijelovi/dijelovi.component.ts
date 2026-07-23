import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DijeloviService } from '../../services/dijelovi.service';
import { Dio } from '../../models/dio.model';
import { DioDialogComponent, DioDialogData } from './dio-dialog/dio-dialog.component';

@Component({
  selector: 'app-dijelovi',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dijelovi.component.html',
  styleUrl: './dijelovi.component.scss'
})
export class DijeloviComponent implements OnInit {
  private readonly dijeloviService = inject(DijeloviService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'id',
    'naziv',
    'cijena',
    'kolicinaNaStanju',
    'minimalnaKolicina',
    'servisniNalogId',
    'actions'
  ];
  readonly dijelovi = signal<Dio[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDijelovi();
  }

  loadDijelovi(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.dijeloviService.getAll().subscribe({
      next: (data) => {
        this.dijelovi.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja dijelova.');
      }
    });
  }

  openDialog(dio?: Dio): void {
    const dialogRef = this.dialog.open<DioDialogComponent, DioDialogData, Dio>(
      DioDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { dio: dio ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const request = result.id
        ? this.dijeloviService.update(result.id, result)
        : this.dijeloviService.create(result);

      request.subscribe({
        next: () => this.loadDijelovi(),
        error: (err) => {
          this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom čuvanja dijela.');
        }
      });
    });
  }

  deleteDio(dio: Dio): void {
    if (!dio.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati dio "${dio.naziv}"?`);
    if (!potvrda) {
      return;
    }

    this.dijeloviService.delete(dio.id).subscribe({
      next: () => this.dijelovi.update((list) => list.filter((d) => d.id !== dio.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja dijela.')
    });
  }
}
