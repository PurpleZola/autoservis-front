import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Klijent } from '../../../models/klijent.model';
import { Korisnik } from '../../../models/korisnik.model';
import { KorisniciService } from '../../../services/korisnici.service';

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
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './klijent-dialog.component.html',
  styleUrl: './klijent-dialog.component.scss'
})
export class KlijentDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<KlijentDialogComponent>);
  private readonly data = inject<KlijentDialogData>(MAT_DIALOG_DATA);
  private readonly korisniciService = inject(KorisniciService);

  readonly isEditMode = this.data.klijent !== null;
  readonly korisnici = signal<Korisnik[]>([]);
  readonly loadingKorisnici = signal(false);

  readonly form = this.fb.group({
    ime: [this.data.klijent?.ime ?? '', Validators.required],
    prezime: [this.data.klijent?.prezime ?? '', Validators.required],
    telefon: [this.data.klijent?.telefon ?? '', Validators.required],
    adresa: [this.data.klijent?.adresa ?? '', Validators.required],
    korisnikId: [this.data.klijent?.korisnikId ?? null, Validators.required]
  });

  ngOnInit(): void {
    this.loadingKorisnici.set(true);
    this.korisniciService.getAll().subscribe({
      next: (data) => {
        this.korisnici.set(data);
        this.loadingKorisnici.set(false);
      },
      error: () => this.loadingKorisnici.set(false)
    });
  }

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
