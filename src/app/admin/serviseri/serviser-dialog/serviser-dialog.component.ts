import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Serviser } from '../../../models/serviser.model';

export interface ServiserDialogData {
  serviser: Serviser | null;
}

@Component({
  selector: 'app-serviser-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './serviser-dialog.component.html',
  styleUrl: './serviser-dialog.component.scss'
})
export class ServiserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ServiserDialogComponent>);
  private readonly data = inject<ServiserDialogData>(MAT_DIALOG_DATA);

  readonly isEditMode = this.data.serviser !== null;

  readonly form = this.fb.group({
    ime: [this.data.serviser?.ime ?? '', Validators.required],
    prezime: [this.data.serviser?.prezime ?? '', Validators.required],
    specijalnost: [this.data.serviser?.specijalnost ?? '', Validators.required],
    telefon: [this.data.serviser?.telefon ?? '', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const serviser: Serviser = {
      id: this.data.serviser?.id,
      ime: value.ime!,
      prezime: value.prezime!,
      specijalnost: value.specijalnost!,
      telefon: value.telefon!
    };

    this.dialogRef.close(serviser);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
