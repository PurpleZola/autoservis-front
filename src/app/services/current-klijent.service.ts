import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { KorisniciService } from './korisnici.service';
import { KlijentiService } from './klijenti.service';
import { Klijent } from '../models/klijent.model';

@Injectable({
  providedIn: 'root'
})
export class CurrentKlijentService {
  private readonly authService = inject(AuthService);
  private readonly korisniciService = inject(KorisniciService);
  private readonly klijentiService = inject(KlijentiService);

  getCurrentKlijent(): Observable<Klijent | null> {
    const email = this.authService.getEmail();
    if (!email) {
      return of(null);
    }

    return this.korisniciService.getAll().pipe(
      switchMap((korisnici) => {
        const korisnik = korisnici.find((k) => k.email === email);
        if (!korisnik?.id) {
          return of(null);
        }

        return this.klijentiService.getAll().pipe(
          map((klijenti) => klijenti.find((k) => k.korisnikId === korisnik.id) ?? null)
        );
      })
    );
  }
}
