import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PredvidjanjeKvara, PreporukaDijelova } from '../models/ai.model';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly apiUrl = 'http://localhost:8080/api/ai';

  constructor(private http: HttpClient) {}

  predvidiKvar(voziloId: number): Observable<PredvidjanjeKvara> {
    return this.http.get<PredvidjanjeKvara>(`${this.apiUrl}/predvidi-kvar/${voziloId}`);
  }

  preporuciDijelove(voziloId: number): Observable<PreporukaDijelova> {
    return this.http.get<PreporukaDijelova>(`${this.apiUrl}/preporuci-dijelove/${voziloId}`);
  }
}
