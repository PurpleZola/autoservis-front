import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TerminService } from '../../../services/termin.service';
import { Termin } from '../../../models/termin.model';
import { Vozilo } from '../../../models/vozilo.model';

export interface ZakazivanjeDialogData {
  datum: string;
  vozila: Vozilo[];
  klijentId: number;
}

@Component({
  selector: 'app-zakazivanje-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './zakazivanje-dialog.component.html',
  styleUrl: './zakazivanje-dialog.component.scss'
})
export class ZakazivanjeDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly terminService = inject(TerminService);
  private readonly dialogRef = inject(MatDialogRef<ZakazivanjeDialogComponent, Termin>);
  readonly data = inject<ZakazivanjeDialogData>(MAT_DIALOG_DATA);

  readonly vrijemeOptions = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  readonly zauzetaVremena = signal<Set<string>>(new Set());
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    voziloId: [null as number | null, Validators.required],
    vrijemeTermina: ['08:00', Validators.required],
    opisProblema: ['', Validators.required]
  });

  ngOnInit(): void {
    this.terminService.getByDatum(this.data.datum).subscribe({
      next: (termini) => {
        const zauzeta = new Set(
          termini.filter((t) => t.status !== 'ODBIJEN').map((t) => t.vrijemeTermina.slice(0, 5))
        );
        this.zauzetaVremena.set(zauzeta);

        const izabranoVrijeme = this.form.controls.vrijemeTermina.value;
        if (izabranoVrijeme && zauzeta.has(izabranoVrijeme)) {
          const slobodno = this.vrijemeOptions.find((v) => !zauzeta.has(v));
          this.form.controls.vrijemeTermina.setValue(slobodno ?? null);
        }
      },
      // Ako provjera dostupnosti ne uspije, ne blokiramo zakazivanje - backend
      // i dalje odbija stvarne konflikte, samo bez unaprijed sivih termina.
      error: () => {}
    });
  }

  onSubmit(): void {
    const izabranoVrijeme = this.form.controls.vrijemeTermina.value;
    if (this.form.invalid || (izabranoVrijeme && this.zauzetaVremena().has(izabranoVrijeme))) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const termin: Termin = {
      datumTermina: this.data.datum,
      vrijemeTermina: value.vrijemeTermina!,
      opisProblema: value.opisProblema!,
      status: 'CEKA',
      voziloId: value.voziloId!,
      klijentId: this.data.klijentId
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.terminService.create(termin).subscribe({
      next: (created) => this.dialogRef.close(created),
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom zakazivanja termina.');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
