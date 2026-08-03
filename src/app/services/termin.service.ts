import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Termin } from '../models/termin.model';

@Injectable({
  providedIn: 'root'
})
export class TerminService {
  private readonly apiUrl = 'http://localhost:8080/api/termini';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Termin[]> {
    return this.http.get<Termin[]>(this.apiUrl);
  }

  getByDatum(datum: string): Observable<Termin[]> {
    return this.http.get<Termin[]>(`${this.apiUrl}/datum/${datum}`);
  }

  create(termin: Termin): Observable<Termin> {
    return this.http.post<Termin>(this.apiUrl, termin);
  }

  update(id: number, termin: Termin): Observable<Termin> {
    return this.http.put<Termin>(`${this.apiUrl}/${id}`, termin);
  }

  updateStatus(id: number, status: string, razlogOdbijanja?: string): Observable<Termin> {
    return this.http.put<Termin>(`${this.apiUrl}/${id}/status`, { status, razlogOdbijanja });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
