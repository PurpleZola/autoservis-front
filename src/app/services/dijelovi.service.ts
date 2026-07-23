import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Dio } from '../models/dio.model';

@Injectable({
  providedIn: 'root'
})
export class DijeloviService {
  private readonly apiUrl = 'http://localhost:8080/api/dijelovi';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Dio[]> {
    return this.http.get<Dio[]>(this.apiUrl);
  }

  create(dio: Dio): Observable<Dio> {
    return this.http.post<Dio>(this.apiUrl, dio);
  }

  update(id: number, dio: Dio): Observable<Dio> {
    return this.http.put<Dio>(`${this.apiUrl}/${id}`, dio);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
