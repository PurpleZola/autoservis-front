import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Kvar } from '../../../models/kvar.model';
import { ServisniNalog } from '../../../models/servisni-nalog.model';
import { ServisniNaloziService } from '../../../services/servisni-nalozi.service';

export interface KvarDialogData {
  kvar: Kvar | null;
}

@Component({
  selector: 'app-kvar-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './kvar-dialog.component.html',
  styleUrl: './kvar-dialog.component.scss'
})
export class KvarDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<KvarDialogComponent>);
  private readonly data = inject<KvarDialogData>(MAT_DIALOG_DATA);
  private readonly servisniNaloziService = inject(ServisniNaloziService);

  readonly isEditMode = this.data.kvar !== null;
  readonly servisniNalozi = signal<ServisniNalog[]>([]);
  readonly loadingServisniNalozi = signal(false);

  readonly form = this.fb.group({
    naziv: [this.data.kvar?.naziv ?? '', Validators.required],
    opis: [this.data.kvar?.opis ?? '', Validators.required],
    servisniNalogId: [this.data.kvar?.servisniNalogId ?? null, Validators.required]
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
    const kvar: Kvar = {
      id: this.data.kvar?.id,
      naziv: value.naziv!,
      opis: value.opis!,
      servisniNalogId: value.servisniNalogId!
    };

    this.dialogRef.close(kvar);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
