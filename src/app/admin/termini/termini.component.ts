import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { TerminService } from '../../services/termin.service';
import { Termin } from '../../models/termin.model';
import {
  RazlogOdbijanjaDialogComponent,
  RazlogOdbijanjaDialogData
} from './razlog-odbijanja-dialog/razlog-odbijanja-dialog.component';

@Component({
  selector: 'app-termini',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './termini.component.html',
  styleUrl: './termini.component.scss'
})
export class TerminiComponent implements OnInit {
  private readonly terminService = inject(TerminService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['datumTermina', 'vrijemeTermina', 'opisProblema', 'status', 'actions'];
  readonly termini = signal<Termin[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTermini();
  }

  loadTermini(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.terminService.getAll().subscribe({
      next: (data) => {
        this.termini.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja termina.');
      }
    });
  }

  prihvati(termin: Termin): void {
    this.setStatus(termin, 'PRIHVACEN');
  }

  odbij(termin: Termin): void {
    const dialogRef = this.dialog.open<RazlogOdbijanjaDialogComponent, RazlogOdbijanjaDialogData, string>(
      RazlogOdbijanjaDialogComponent,
      { width: '420px', panelClass: 'app-dialog-panel', data: { termin } }
    );

    dialogRef.afterClosed().subscribe((razlog) => {
      if (razlog === undefined) return;
      this.setStatus(termin, 'ODBIJEN', razlog || undefined);
    });
  }

  private setStatus(termin: Termin, status: string, razlogOdbijanja?: string): void {
    if (!termin.id) return;
    const id = termin.id;

    this.terminService.updateStatus(id, status, razlogOdbijanja).subscribe({
      next: () =>
        this.termini.update((list) =>
          list.map((t) => (t.id === id ? { ...t, status, razlogOdbijanja } : t))
        ),
      error: () => this.errorMessage.set('Greška prilikom ažuriranja statusa termina.')
    });
  }
}
