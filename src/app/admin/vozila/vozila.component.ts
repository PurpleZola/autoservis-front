import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { VozilaService } from '../../services/vozila.service';
import { Vozilo } from '../../models/vozilo.model';
import { VoziloDialogComponent, VoziloDialogData } from './vozilo-dialog/vozilo-dialog.component';

@Component({
  selector: 'app-vozila',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './vozila.component.html',
  styleUrl: './vozila.component.scss'
})
export class VozilaComponent implements OnInit {
  private readonly vozilaService = inject(VozilaService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'id',
    'marka',
    'model',
    'godina',
    'registracija',
    'boja',
    'gorivo',
    'kilometraza',
    'actions'
  ];
  readonly vozila = signal<Vozilo[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadVozila();
  }

  loadVozila(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.vozilaService.getAll().subscribe({
      next: (data) => {
        this.vozila.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja vozila.');
      }
    });
  }

  openDialog(vozilo?: Vozilo): void {
    const dialogRef = this.dialog.open<VoziloDialogComponent, VoziloDialogData, Vozilo>(
      VoziloDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { vozilo: vozilo ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const request = result.id
        ? this.vozilaService.update(result.id, result)
        : this.vozilaService.create(result);

      request.subscribe({
        next: () => this.loadVozila(),
        error: (err) => {
          this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom čuvanja vozila.');
        }
      });
    });
  }

  deleteVozilo(vozilo: Vozilo): void {
    if (!vozilo.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati vozilo ${vozilo.marka} ${vozilo.model}?`);
    if (!potvrda) {
      return;
    }

    this.vozilaService.delete(vozilo.id).subscribe({
      next: () => this.vozila.update((list) => list.filter((v) => v.id !== vozilo.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja vozila.')
    });
  }
}
