import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Korisnik } from '../../../models/korisnik.model';

export interface KorisnikDialogData {
  korisnik: Korisnik | null;
}

export interface KorisnikDialogResult {
  isNew: boolean;
  id?: number;
  email: string;
  lozinka?: string;
  rola: string;
}

@Component({
  selector: 'app-korisnik-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './korisnik-dialog.component.html',
  styleUrl: './korisnik-dialog.component.scss'
})
export class KorisnikDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<KorisnikDialogComponent>);
  private readonly data = inject<KorisnikDialogData>(MAT_DIALOG_DATA);

  readonly isEditMode = this.data.korisnik !== null;

  readonly form = this.fb.group({
    email: [
      { value: this.data.korisnik?.email ?? '', disabled: this.isEditMode },
      this.isEditMode ? [] : [Validators.required, Validators.email]
    ],
    lozinka: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(4)]],
    rola: [this.data.korisnik?.rola ?? 'USER', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const result: KorisnikDialogResult = this.isEditMode
      ? {
          isNew: false,
          id: this.data.korisnik!.id,
          email: this.data.korisnik!.email,
          rola: value.rola!
        }
      : {
          isNew: true,
          email: value.email!,
          lozinka: value.lozinka!,
          rola: value.rola!
        };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
