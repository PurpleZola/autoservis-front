import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Kvar } from '../models/kvar.model';

@Injectable({
  providedIn: 'root'
})
export class KvaroviService {
  private readonly apiUrl = 'http://localhost:8080/api/kvarovi';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Kvar[]> {
    return this.http.get<Kvar[]>(this.apiUrl);
  }

  create(kvar: Kvar): Observable<Kvar> {
    return this.http.post<Kvar>(this.apiUrl, kvar);
  }

  update(id: number, kvar: Kvar): Observable<Kvar> {
    return this.http.put<Kvar>(`${this.apiUrl}/${id}`, kvar);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
