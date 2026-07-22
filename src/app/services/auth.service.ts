import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  token: string;
  rola: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, lozinka: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, lozinka });
  }

  register(email: string, lozinka: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, lozinka });
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveRole(rola: string): void {
    localStorage.setItem('rola', rola);
  }

  getRole(): string | null {
    return localStorage.getItem('rola');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rola');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
