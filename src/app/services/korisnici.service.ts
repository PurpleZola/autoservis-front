import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Korisnik } from '../models/korisnik.model';

@Injectable({
  providedIn: 'root'
})
export class KorisniciService {
  private readonly apiUrl = 'http://localhost:8080/api/korisnici';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Korisnik[]> {
    return this.http.get<Korisnik[]>(this.apiUrl);
  }

  update(id: number, korisnik: Korisnik): Observable<Korisnik> {
    return this.http.put<Korisnik>(`${this.apiUrl}/${id}`, korisnik);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
