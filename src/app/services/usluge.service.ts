import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Usluga } from '../models/usluga.model';

@Injectable({
  providedIn: 'root'
})
export class UslugeService {
  private readonly apiUrl = 'http://localhost:8080/api/usluge';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Usluga[]> {
    return this.http.get<Usluga[]>(this.apiUrl);
  }

  create(usluga: Usluga): Observable<Usluga> {
    return this.http.post<Usluga>(this.apiUrl, usluga);
  }

  update(id: number, usluga: Usluga): Observable<Usluga> {
    return this.http.put<Usluga>(`${this.apiUrl}/${id}`, usluga);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
