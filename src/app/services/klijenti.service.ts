import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Klijent } from '../models/klijent.model';

@Injectable({
  providedIn: 'root'
})
export class KlijentiService {
  private readonly apiUrl = 'http://localhost:8080/api/klijenti';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Klijent[]> {
    return this.http.get<Klijent[]>(this.apiUrl);
  }

  create(klijent: Klijent): Observable<Klijent> {
    return this.http.post<Klijent>(this.apiUrl, klijent);
  }

  update(id: number, klijent: Klijent): Observable<Klijent> {
    return this.http.put<Klijent>(`${this.apiUrl}/${id}`, klijent);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
