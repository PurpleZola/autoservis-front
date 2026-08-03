import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { TerminService } from '../../services/termin.service';
import { Termin } from '../../models/termin.model';
import {
  RazlogOdbijanjaDialogComponent,
  RazlogOdbijanjaDialogData
} from './razlog-odbijanja-dialog/razlog-odbijanja-dialog.component';

type StatusFilter = 'SVI' | 'CEKA' | 'PRIHVACEN' | 'ODBIJEN';

@Component({
  selector: 'app-termini',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './termini.component.html',
  styleUrl: './termini.component.scss'
})
export class TerminiComponent implements OnInit {
  private readonly terminService = inject(TerminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly displayedColumns = ['datumTermina', 'vrijemeTermina', 'opisProblema', 'status', 'actions'];
  readonly termini = signal<Termin[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly pageSizeOptions = [5, 10, 25];
  readonly statusFilter = signal<StatusFilter>('SVI');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly filteredTermini = computed(() => {
    const filter = this.statusFilter();
    const list = this.termini();
    return filter === 'SVI' ? list : list.filter((t) => t.status === filter);
  });

  readonly pagedTermini = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredTermini().slice(start, start + this.pageSize());
  });

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

  onFilterChange(event: MatSelectChange): void {
    this.statusFilter.set(event.value as StatusFilter);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
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

  obrisi(termin: Termin): void {
    if (!termin.id) return;

    const potvrda = confirm(
      `Da li ste sigurni da želite obrisati termin za ${termin.datumTermina} u ${termin.vrijemeTermina}?`
    );
    if (!potvrda) return;

    const id = termin.id;
    this.terminService.delete(id).subscribe({
      next: () => {
        this.termini.update((list) => list.filter((t) => t.id !== id));
        this.clampPageIndex();
        this.snackBar.open('Termin obrisan', 'OK', { duration: 3000, panelClass: ['app-success-snackbar'] });
      },
      error: () => this.errorMessage.set('Greška prilikom brisanja termina.')
    });
  }

  private setStatus(termin: Termin, status: string, razlogOdbijanja?: string): void {
    if (!termin.id) return;
    const id = termin.id;

    this.terminService.updateStatus(id, status, razlogOdbijanja).subscribe({
      next: (updated) => {
        this.termini.update((list) =>
          list.map((t) => (t.id === id ? { ...t, status, razlogOdbijanja } : t))
        );
        this.clampPageIndex();

        if (status === 'PRIHVACEN' && updated.servisniNalogId) {
          this.snackBar
            .open('Termin prihvaćen i servisni nalog kreiran.', 'Otvori', {
              duration: 5000,
              panelClass: ['app-success-snackbar']
            })
            .onAction()
            .subscribe(() => this.router.navigate(['/admin/servisni-nalozi']));
        }
      },
      error: () => this.errorMessage.set('Greška prilikom ažuriranja statusa termina.')
    });
  }

  private clampPageIndex(): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredTermini().length / this.pageSize()));
    if (this.pageIndex() > totalPages - 1) {
      this.pageIndex.set(totalPages - 1);
    }
  }
}
