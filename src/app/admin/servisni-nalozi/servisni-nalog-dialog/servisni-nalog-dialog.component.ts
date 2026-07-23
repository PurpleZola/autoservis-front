import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { ServisniNalog } from '../../../models/servisni-nalog.model';
import { Vozilo } from '../../../models/vozilo.model';
import { Serviser } from '../../../models/serviser.model';
import { VozilaService } from '../../../services/vozila.service';
import { ServiseriService } from '../../../services/serviseri.service';

export interface ServisniNalogDialogData {
  servisniNalog: ServisniNalog | null;
}

@Component({
  selector: 'app-servisni-nalog-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './servisni-nalog-dialog.component.html',
  styleUrl: './servisni-nalog-dialog.component.scss'
})
export class ServisniNalogDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ServisniNalogDialogComponent>);
  private readonly data = inject<ServisniNalogDialogData>(MAT_DIALOG_DATA);
  private readonly vozilaService = inject(VozilaService);
  private readonly serviseriService = inject(ServiseriService);

  readonly isEditMode = this.data.servisniNalog !== null;
  readonly statusOptions = ['PRIMLJEN', 'U_RADU', 'ZAVRSEN'];
  readonly vozila = signal<Vozilo[]>([]);
  readonly serviseri = signal<Serviser[]>([]);
  readonly loadingOptions = signal(false);

  readonly form = this.fb.group({
    datumPrijema: [this.data.servisniNalog?.datumPrijema ?? '', Validators.required],
    datumZavrsetka: [this.data.servisniNalog?.datumZavrsetka ?? ''],
    opisProblema: [this.data.servisniNalog?.opisProblema ?? '', Validators.required],
    status: [this.data.servisniNalog?.status ?? 'PRIMLJEN', Validators.required],
    sledeciServisDatum: [this.data.servisniNalog?.sledeciServisDatum ?? ''],
    voziloId: [this.data.servisniNalog?.voziloId ?? null, Validators.required],
    serviserID: [this.data.servisniNalog?.serviserID ?? null, Validators.required]
  });

  ngOnInit(): void {
    this.loadingOptions.set(true);
    this.vozilaService.getAll().subscribe({
      next: (data) => this.vozila.set(data),
      error: () => {}
    });
    this.serviseriService.getAll().subscribe({
      next: (data) => {
        this.serviseri.set(data);
        this.loadingOptions.set(false);
      },
      error: () => this.loadingOptions.set(false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const servisniNalog: ServisniNalog = {
      id: this.data.servisniNalog?.id,
      datumPrijema: value.datumPrijema!,
      datumZavrsetka: value.datumZavrsetka || undefined,
      opisProblema: value.opisProblema!,
      status: value.status!,
      sledeciServisDatum: value.sledeciServisDatum || undefined,
      voziloId: value.voziloId!,
      serviserID: value.serviserID!
    };

    this.dialogRef.close(servisniNalog);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
