import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Vozilo } from '../models/vozilo.model';

@Injectable({
  providedIn: 'root'
})
export class VozilaService {
  private readonly apiUrl = 'http://localhost:8080/api/vozila';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vozilo[]> {
    return this.http.get<Vozilo[]>(this.apiUrl);
  }

  create(vozilo: Vozilo): Observable<Vozilo> {
    return this.http.post<Vozilo>(this.apiUrl, vozilo);
  }

  update(id: number, vozilo: Vozilo): Observable<Vozilo> {
    return this.http.put<Vozilo>(`${this.apiUrl}/${id}`, vozilo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
