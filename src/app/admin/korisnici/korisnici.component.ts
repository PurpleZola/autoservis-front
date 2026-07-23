import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { KorisniciService } from '../../services/korisnici.service';
import { AuthService } from '../../services/auth.service';
import { Korisnik } from '../../models/korisnik.model';
import {
  KorisnikDialogComponent,
  KorisnikDialogData,
  KorisnikDialogResult
} from './korisnik-dialog/korisnik-dialog.component';

@Component({
  selector: 'app-korisnici',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.scss'
})
export class KorisniciComponent implements OnInit {
  private readonly korisniciService = inject(KorisniciService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['id', 'email', 'rola', 'actions'];
  readonly korisnici = signal<Korisnik[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadKorisnici();
  }

  loadKorisnici(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.korisniciService.getAll().subscribe({
      next: (data) => {
        this.korisnici.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Greška prilikom učitavanja korisnika.');
      }
    });
  }

  openDialog(korisnik?: Korisnik): void {
    const dialogRef = this.dialog.open<KorisnikDialogComponent, KorisnikDialogData, KorisnikDialogResult>(
      KorisnikDialogComponent,
      {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { korisnik: korisnik ?? null }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      if (result.isNew) {
        this.authService.register(result.email, result.lozinka!, result.rola).subscribe({
          next: () => this.loadKorisnici(),
          error: (err) => {
            this.errorMessage.set(err?.error?.greska ?? 'Greška prilikom dodavanja korisnika.');
          }
        });
        return;
      }

      this.korisniciService.update(result.id!, { id: result.id, email: result.email, rola: result.rola }).subscribe({
        next: () => this.loadKorisnici(),
        error: () => this.errorMessage.set('Greška prilikom izmjene korisnika.')
      });
    });
  }

  deleteKorisnik(korisnik: Korisnik): void {
    if (!korisnik.id) {
      return;
    }

    const potvrda = confirm(`Da li ste sigurni da želite obrisati korisnika ${korisnik.email}?`);
    if (!potvrda) {
      return;
    }

    this.korisniciService.delete(korisnik.id).subscribe({
      next: () => this.korisnici.update((list) => list.filter((k) => k.id !== korisnik.id)),
      error: () => this.errorMessage.set('Greška prilikom brisanja korisnika.')
    });
  }
}
