import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ServisniNalog } from '../models/servisni-nalog.model';

@Injectable({
  providedIn: 'root'
})
export class ServisniNaloziService {
  private readonly apiUrl = 'http://localhost:8080/api/servisni-nalozi';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ServisniNalog[]> {
    return this.http.get<ServisniNalog[]>(this.apiUrl);
  }

  create(servisniNalog: ServisniNalog): Observable<ServisniNalog> {
    return this.http.post<ServisniNalog>(this.apiUrl, servisniNalog);
  }

  update(id: number, servisniNalog: ServisniNalog): Observable<ServisniNalog> {
    return this.http.put<ServisniNalog>(`${this.apiUrl}/${id}`, servisniNalog);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
