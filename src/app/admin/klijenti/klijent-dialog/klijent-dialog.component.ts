import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Klijent } from '../../../models/klijent.model';

export interface KlijentDialogData {
  klijent: Klijent | null;
}

@Component({
  selector: 'app-klijent-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './klijent-dialog.component.html',
  styleUrl: './klijent-dialog.component.scss'
})
export class KlijentDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<KlijentDialogComponent>);
  private readonly data = inject<KlijentDialogData>(MAT_DIALOG_DATA);

  readonly isEditMode = this.data.klijent !== null;

  readonly form = this.fb.group({
    ime: [this.data.klijent?.ime ?? '', Validators.required],
    prezime: [this.data.klijent?.prezime ?? '', Validators.required],
    telefon: [this.data.klijent?.telefon ?? '', Validators.required],
    adresa: [this.data.klijent?.adresa ?? '', Validators.required],
    korisnikId: [this.data.klijent?.korisnikId ?? null, [Validators.required, Validators.min(1)]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const klijent: Klijent = {
      id: this.data.klijent?.id,
      ime: value.ime!,
      prezime: value.prezime!,
      telefon: value.telefon!,
      adresa: value.adresa!,
      korisnikId: value.korisnikId!
    };

    this.dialogRef.close(klijent);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
