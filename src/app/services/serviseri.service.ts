import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Serviser } from '../models/serviser.model';

@Injectable({
  providedIn: 'root'
})
export class ServiseriService {
  private readonly apiUrl = 'http://localhost:8080/api/serviseri';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Serviser[]> {
    return this.http.get<Serviser[]>(this.apiUrl);
  }

  create(serviser: Serviser): Observable<Serviser> {
    return this.http.post<Serviser>(this.apiUrl, serviser);
  }

  update(id: number, serviser: Serviser): Observable<Serviser> {
    return this.http.put<Serviser>(`${this.apiUrl}/${id}`, serviser);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
