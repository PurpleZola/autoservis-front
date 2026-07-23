import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Usluga } from '../../../models/usluga.model';
import { ServisniNalog } from '../../../models/servisni-nalog.model';
import { ServisniNaloziService } from '../../../services/servisni-nalozi.service';

export interface UslugaDialogData {
  usluga: Usluga | null;
}

@Component({
  selector: 'app-usluga-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './usluga-dialog.component.html',
  styleUrl: './usluga-dialog.component.scss'
})
export class UslugaDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UslugaDialogComponent>);
  private readonly data = inject<UslugaDialogData>(MAT_DIALOG_DATA);
  private readonly servisniNaloziService = inject(ServisniNaloziService);

  readonly isEditMode = this.data.usluga !== null;
  readonly servisniNalozi = signal<ServisniNalog[]>([]);
  readonly loadingServisniNalozi = signal(false);

  readonly form = this.fb.group({
    naziv: [this.data.usluga?.naziv ?? '', Validators.required],
    cijena: [this.data.usluga?.cijena ?? null, [Validators.required, Validators.min(0)]],
    servisniNalogId: [this.data.usluga?.servisniNalogId ?? null, Validators.required]
  });

  ngOnInit(): void {
    this.loadingServisniNalozi.set(true);
    this.servisniNaloziService.getAll().subscribe({
      next: (data) => {
        this.servisniNalozi.set(data);
        this.loadingServisniNalozi.set(false);
      },
      error: () => this.loadingServisniNalozi.set(false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const usluga: Usluga = {
      id: this.data.usluga?.id,
      naziv: value.naziv!,
      cijena: value.cijena!,
      servisniNalogId: value.servisniNalogId!
    };

    this.dialogRef.close(usluga);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
