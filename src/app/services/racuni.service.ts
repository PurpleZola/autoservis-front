import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Racun } from '../models/racun.model';

@Injectable({
  providedIn: 'root'
})
export class RacuniService {
  private readonly apiUrl = 'http://localhost:8080/api/racuni';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Racun[]> {
    return this.http.get<Racun[]>(this.apiUrl);
  }

  create(racun: Racun): Observable<Racun> {
    return this.http.post<Racun>(this.apiUrl, racun);
  }

  update(id: number, racun: Racun): Observable<Racun> {
    return this.http.put<Racun>(`${this.apiUrl}/${id}`, racun);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
