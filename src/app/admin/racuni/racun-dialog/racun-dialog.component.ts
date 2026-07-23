import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Racun } from '../../../models/racun.model';
import { ServisniNalog } from '../../../models/servisni-nalog.model';
import { ServisniNaloziService } from '../../../services/servisni-nalozi.service';

export interface RacunDialogData {
  racun: Racun | null;
}

@Component({
  selector: 'app-racun-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './racun-dialog.component.html',
  styleUrl: './racun-dialog.component.scss'
})
export class RacunDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RacunDialogComponent>);
  private readonly data = inject<RacunDialogData>(MAT_DIALOG_DATA);
  private readonly servisniNaloziService = inject(ServisniNaloziService);

  readonly isEditMode = this.data.racun !== null;
  readonly servisniNalozi = signal<ServisniNalog[]>([]);
  readonly loadingServisniNalozi = signal(false);

  readonly form = this.fb.group({
    datum: [this.data.racun?.datum ?? '', Validators.required],
    ukupnaCijena: [this.data.racun?.ukupnaCijena ?? null, [Validators.required, Validators.min(0)]],
    napomena: [this.data.racun?.napomena ?? ''],
    servisniNalogId: [this.data.racun?.servisniNalogId ?? null, Validators.required]
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
    const racun: Racun = {
      id: this.data.racun?.id,
      datum: value.datum!,
      ukupnaCijena: value.ukupnaCijena!,
      napomena: value.napomena || undefined,
      servisniNalogId: value.servisniNalogId!
    };

    this.dialogRef.close(racun);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
