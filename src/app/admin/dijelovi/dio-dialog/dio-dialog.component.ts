import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Dio } from '../../../models/dio.model';
import { ServisniNalog } from '../../../models/servisni-nalog.model';
import { ServisniNaloziService } from '../../../services/servisni-nalozi.service';

export interface DioDialogData {
  dio: Dio | null;
}

@Component({
  selector: 'app-dio-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './dio-dialog.component.html',
  styleUrl: './dio-dialog.component.scss'
})
export class DioDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DioDialogComponent>);
  private readonly data = inject<DioDialogData>(MAT_DIALOG_DATA);
  private readonly servisniNaloziService = inject(ServisniNaloziService);

  readonly isEditMode = this.data.dio !== null;
  readonly servisniNalozi = signal<ServisniNalog[]>([]);
  readonly loadingServisniNalozi = signal(false);

  readonly form = this.fb.group({
    naziv: [this.data.dio?.naziv ?? '', Validators.required],
    cijena: [this.data.dio?.cijena ?? null, [Validators.required, Validators.min(0)]],
    kolicinaNaStanju: [this.data.dio?.kolicinaNaStanju ?? null, [Validators.required, Validators.min(0)]],
    minimalnaKolicina: [this.data.dio?.minimalnaKolicina ?? null, [Validators.required, Validators.min(0)]],
    servisniNalogId: [this.data.dio?.servisniNalogId ?? null, Validators.required]
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
    const dio: Dio = {
      id: this.data.dio?.id,
      naziv: value.naziv!,
      cijena: value.cijena!,
      kolicinaNaStanju: value.kolicinaNaStanju!,
      minimalnaKolicina: value.minimalnaKolicina!,
      servisniNalogId: value.servisniNalogId!
    };

    this.dialogRef.close(dio);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
