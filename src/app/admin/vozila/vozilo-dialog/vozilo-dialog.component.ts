import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Vozilo } from '../../../models/vozilo.model';
import { Klijent } from '../../../models/klijent.model';
import { KlijentiService } from '../../../services/klijenti.service';

export interface VoziloDialogData {
  vozilo: Vozilo | null;
}

@Component({
  selector: 'app-vozilo-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './vozilo-dialog.component.html',
  styleUrl: './vozilo-dialog.component.scss'
})
export class VoziloDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<VoziloDialogComponent>);
  private readonly data = inject<VoziloDialogData>(MAT_DIALOG_DATA);
  private readonly klijentiService = inject(KlijentiService);

  readonly isEditMode = this.data.vozilo !== null;
  readonly klijenti = signal<Klijent[]>([]);
  readonly loadingKlijenti = signal(false);

  readonly form = this.fb.group({
    marka: [this.data.vozilo?.marka ?? '', Validators.required],
    model: [this.data.vozilo?.model ?? '', Validators.required],
    godina: [this.data.vozilo?.godina ?? null, [Validators.required, Validators.min(1900)]],
    registracija: [this.data.vozilo?.registracija ?? '', Validators.required],
    boja: [this.data.vozilo?.boja ?? '', Validators.required],
    brojSasije: [this.data.vozilo?.brojSasije ?? '', Validators.required],
    gorivo: [this.data.vozilo?.gorivo ?? '', Validators.required],
    kilometraza: [this.data.vozilo?.kilometraza ?? null, [Validators.required, Validators.min(0)]],
    klijentId: [this.data.vozilo?.klijentId ?? null, Validators.required]
  });

  ngOnInit(): void {
    this.loadingKlijenti.set(true);
    this.klijentiService.getAll().subscribe({
      next: (data) => {
        this.klijenti.set(data);
        this.loadingKlijenti.set(false);
      },
      error: () => this.loadingKlijenti.set(false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const vozilo: Vozilo = {
      id: this.data.vozilo?.id,
      marka: value.marka!,
      model: value.model!,
      godina: value.godina!,
      registracija: value.registracija!,
      boja: value.boja!,
      brojSasije: value.brojSasije!,
      gorivo: value.gorivo!,
      kilometraza: value.kilometraza!,
      klijentId: value.klijentId!
    };

    this.dialogRef.close(vozilo);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
