import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ServisniNaloziService } from '../../services/servisni-nalozi.service';
import { ServisniNalog } from '../../models/servisni-nalog.model';
import {
  ServisniNalogDialogComponent,
  ServisniNalogDialogData
} from './servisni-nalog-dialog/servisni-nalog-dialog.component';

@Component({
  selector: 'app-servisni-nalozi',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './servisni-nalozi.component.html',
  styleUrl: './servisni-nalozi.component.scss'
})
export class ServisniNaloziComponent implements OnInit {
  private readonly servisniNaloziService = inject(ServisniNaloziService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'id',
    'datumPrijema',
    'datumZavrsetka',
    'opisProblema',
    'status',
    'sledeciServisDatum',
    'actions'
  ];
  readonly servisniNalozi = signal<ServisniNalog[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadServisniNalozi();
  }

  loadServisniNalozi(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.servisniNaloziService.getAll().subscribe({
      next: (data) => {
        this.servisniNalozi.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja servisnih naloga.');
      }
    });
  }

  openDialog(servisniNalog?: ServisniNalog): void {
    const dialogRef = this.dialog.open<ServisniNalogDialogComponent, ServisniNalogDialogData, ServisniNalog>(
      ServisniNalogDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { servisniNalog: servisniNalog ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const request = result.id
        ? this.servisniNaloziService.update(result.id, result)
        : this.servisniNaloziService.create(result);

      request.subscribe({
        next: () => this.loadServisniNalozi(),
        error: (err) => {
          this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom čuvanja servisnog naloga.');
        }
      });
    });
  }

  deleteServisniNalog(servisniNalog: ServisniNalog): void {
    if (!servisniNalog.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati servisni nalog #${servisniNalog.id}?`);
    if (!potvrda) {
      return;
    }

    this.servisniNaloziService.delete(servisniNalog.id).subscribe({
      next: () => this.servisniNalozi.update((list) => list.filter((s) => s.id !== servisniNalog.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja servisnog naloga.')
    });
  }
}
